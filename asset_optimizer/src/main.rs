use anyhow::{Context, Result};
use clap::{Arg, Command};
use futures::future::join_all;
use indicatif::{MultiProgress, ProgressBar, ProgressStyle};
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::Arc;
use tokio::process::Command as TokioCommand;
use walkdir::WalkDir;

#[derive(Debug, Clone)]
struct ConversionSettings {
    video_crf: u8,
    webp_quality: u8,
    output_dir: PathBuf,
    max_concurrent: usize,
    dry_run: bool,
}

#[derive(Debug, Clone)]
struct AssetFile {
    input_path: PathBuf,
    output_path: PathBuf,
    file_type: AssetType,
}

#[derive(Debug, Clone)]
enum AssetType {
    Video,
    Image,
}

#[tokio::main]
async fn main() -> Result<()> {
    let matches = Command::new("Asset Optimizer")
        .version("1.0")
        .about("Optimizes video and image assets using ffmpeg")
        .arg(
            Arg::new("input")
                .short('i')
                .long("input")
                .value_name("DIR")
                .help("Input directory containing assets")
                .default_value("public/assets")
        )
        .arg(
            Arg::new("output")
                .short('o')
                .long("output")
                .value_name("DIR")
                .help("Output directory for optimized assets")
                .default_value("public/assets/optimized")
        )
        .arg(
            Arg::new("video-crf")
                .long("video-crf")
                .value_name("NUMBER")
                .help("Video quality (CRF) for WebM conversion (lower = better quality)")
                .default_value("30")
        )
        .arg(
            Arg::new("webp-quality")
                .long("webp-quality")
                .value_name("NUMBER")
                .help("WebP quality (0-100, higher = better quality)")
                .default_value("85")
        )
        .arg(
            Arg::new("concurrent")
                .short('c')
                .long("concurrent")
                .value_name("NUMBER")
                .help("Maximum concurrent conversions")
                .default_value("4")
        )
        .arg(
            Arg::new("dry-run")
                .long("dry-run")
                .help("Show what would be converted without actually converting")
                .action(clap::ArgAction::SetTrue)
        )
        .get_matches();

    let settings = ConversionSettings {
        video_crf: matches.get_one::<String>("video-crf").unwrap()
            .parse().context("Invalid video CRF value")?,
        webp_quality: matches.get_one::<String>("webp-quality").unwrap()
            .parse().context("Invalid WebP quality value")?,
        output_dir: PathBuf::from(matches.get_one::<String>("output").unwrap()),
        max_concurrent: matches.get_one::<String>("concurrent").unwrap()
            .parse().context("Invalid concurrent value")?,
        dry_run: matches.get_flag("dry-run"),
    };

    let input_dir = matches.get_one::<String>("input").unwrap();
    
    println!("🔍 Scanning for assets in: {}", input_dir);
    let assets = discover_assets(input_dir, &settings.output_dir)?;
    
    if assets.is_empty() {
        println!("❌ No assets found to optimize");
        return Ok(());
    }

    let videos: Vec<_> = assets.iter().filter(|a| matches!(a.file_type, AssetType::Video)).collect();
    let images: Vec<_> = assets.iter().filter(|a| matches!(a.file_type, AssetType::Image)).collect();

    println!("📊 Found {} videos and {} images to optimize", videos.len(), images.len());
    
    if settings.dry_run {
        println!("\n🔮 Dry run mode - showing what would be converted:");
        for asset in &assets {
            println!("  {} -> {}", 
                asset.input_path.display(), 
                asset.output_path.display()
            );
        }
        return Ok(());
    }

    // Create output directory
    tokio::fs::create_dir_all(&settings.output_dir).await
        .context("Failed to create output directory")?;

    // Check if ffmpeg is available
    check_ffmpeg_availability().await?;

    // Process assets with progress tracking
    let multi_progress = MultiProgress::new();
    
    if !videos.is_empty() {
        println!("\n🎬 Converting videos to WebM...");
        process_videos(&videos, &settings, &multi_progress).await?;
    }
    
    if !images.is_empty() {
        println!("\n🖼️  Converting images to WebP...");
        process_images(&images, &settings, &multi_progress).await?;
    }

    println!("\n✅ Asset optimization complete!");
    calculate_and_display_savings(input_dir, &settings.output_dir).await?;

    Ok(())
}

fn discover_assets(input_dir: &str, output_dir: &Path) -> Result<Vec<AssetFile>> {
    let mut assets = Vec::new();
    
    for entry in WalkDir::new(input_dir)
        .follow_links(true)
        .into_iter()
        .filter_map(|e| e.ok())
    {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let extension = path.extension()
            .and_then(|ext| ext.to_str())
            .map(|ext| ext.to_lowercase());

        let (file_type, new_extension) = match extension.as_deref() {
            Some("mp4") => (AssetType::Video, "webm"),
            Some("png") => (AssetType::Image, "webp"),
            _ => continue,
        };

        let relative_path = path.strip_prefix(input_dir)
            .context("Failed to strip input directory prefix")?;
        
        let output_path = output_dir.join(relative_path).with_extension(new_extension);

        assets.push(AssetFile {
            input_path: path.to_path_buf(),
            output_path,
            file_type,
        });
    }

    Ok(assets)
}

async fn check_ffmpeg_availability() -> Result<()> {
    let output = TokioCommand::new("ffmpeg")
        .arg("-version")
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .status()
        .await;

    match output {
        Ok(status) if status.success() => Ok(()),
        _ => anyhow::bail!("ffmpeg not found. Please install ffmpeg and ensure it's in your PATH"),
    }
}

async fn process_videos(
    videos: &[&AssetFile],
    settings: &ConversionSettings,
    multi_progress: &MultiProgress,
) -> Result<()> {
    let semaphore = Arc::new(tokio::sync::Semaphore::new(settings.max_concurrent));
    
    let futures = videos.iter().map(|asset| {
        let asset = (*asset).clone();
        let settings = settings.clone();
        let semaphore = semaphore.clone();
        let multi_progress = multi_progress.clone();
        
        async move {
            let _permit = semaphore.acquire().await?;
            
            let pb = multi_progress.add(ProgressBar::new(100));
            pb.set_style(
                ProgressStyle::default_bar()
                    .template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos:>3}/{len:3} {msg}")
                    .unwrap()
                    .progress_chars("#>-")
            );
            
            let filename = asset.input_path.file_name()
                .and_then(|name| name.to_str())
                .unwrap_or("unknown");
            pb.set_message(format!("Converting {}", filename));
            
            let result = convert_video(&asset, &settings, pb.clone()).await;
            
            if result.is_ok() {
                pb.set_message(format!("✅ {}", filename));
                pb.finish();
            } else {
                pb.set_message(format!("❌ {}", filename));
                pb.abandon();
            }
            
            result
        }
    });

    let results = join_all(futures).await;
    
    // Check for errors
    for result in results {
        result?;
    }

    Ok(())
}

async fn process_images(
    images: &[&AssetFile],
    settings: &ConversionSettings,
    multi_progress: &MultiProgress,
) -> Result<()> {
    let semaphore = Arc::new(tokio::sync::Semaphore::new(settings.max_concurrent));
    
    let futures = images.iter().map(|asset| {
        let asset = (*asset).clone();
        let settings = settings.clone();
        let semaphore = semaphore.clone();
        let multi_progress = multi_progress.clone();
        
        async move {
            let _permit = semaphore.acquire().await?;
            
            let pb = multi_progress.add(ProgressBar::new(100));
            pb.set_style(
                ProgressStyle::default_bar()
                    .template("{spinner:.green} [{elapsed_precise}] [{bar:40.cyan/blue}] {pos:>3}/{len:3} {msg}")
                    .unwrap()
                    .progress_chars("#>-")
            );
            
            let filename = asset.input_path.file_name()
                .and_then(|name| name.to_str())
                .unwrap_or("unknown");
            pb.set_message(format!("Converting {}", filename));
            
            let result = convert_image(&asset, &settings, pb.clone()).await;
            
            if result.is_ok() {
                pb.set_message(format!("✅ {}", filename));
                pb.finish();
            } else {
                pb.set_message(format!("❌ {}", filename));
                pb.abandon();
            }
            
            result
        }
    });

    let results = join_all(futures).await;
    
    // Check for errors
    for result in results {
        result?;
    }

    Ok(())
}

async fn convert_video(
    asset: &AssetFile,
    settings: &ConversionSettings,
    progress: ProgressBar,
) -> Result<()> {
    // Create output directory if it doesn't exist
    if let Some(parent) = asset.output_path.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }

    progress.set_position(10);

    let mut cmd = TokioCommand::new("ffmpeg");
    cmd.arg("-i").arg(&asset.input_path)
        .arg("-c:v").arg("libvpx-vp9")
        .arg("-crf").arg(settings.video_crf.to_string())
        .arg("-b:v").arg("0")
        .arg("-c:a").arg("libopus")
        .arg("-y") // Overwrite output file
        .arg(&asset.output_path)
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    progress.set_position(20);

    let status = cmd.status().await
        .context("Failed to execute ffmpeg")?;

    progress.set_position(90);

    if !status.success() {
        anyhow::bail!("ffmpeg failed to convert video: {}", asset.input_path.display());
    }

    progress.set_position(100);
    Ok(())
}

async fn convert_image(
    asset: &AssetFile,
    settings: &ConversionSettings,
    progress: ProgressBar,
) -> Result<()> {
    // Create output directory if it doesn't exist
    if let Some(parent) = asset.output_path.parent() {
        tokio::fs::create_dir_all(parent).await?;
    }

    progress.set_position(10);

    let mut cmd = TokioCommand::new("ffmpeg");
    cmd.arg("-i").arg(&asset.input_path)
        .arg("-c:v").arg("libwebp")
        .arg("-quality").arg(settings.webp_quality.to_string())
        .arg("-y") // Overwrite output file
        .arg(&asset.output_path)
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    progress.set_position(20);

    let status = cmd.status().await
        .context("Failed to execute ffmpeg")?;

    progress.set_position(90);

    if !status.success() {
        anyhow::bail!("ffmpeg failed to convert image: {}", asset.input_path.display());
    }

    progress.set_position(100);
    Ok(())
}

async fn calculate_and_display_savings(input_dir: &str, output_dir: &Path) -> Result<()> {
    let input_size = get_directory_size(input_dir).await?;
    let output_size = get_directory_size(output_dir).await?;
    
    if input_size > 0 {
        let savings = input_size - output_size;
        let savings_percent = (savings as f64 / input_size as f64) * 100.0;
        
        println!("\n📊 Size Comparison:");
        println!("  Original: {}", format_bytes(input_size));
        println!("  Optimized: {}", format_bytes(output_size));
        println!("  Savings: {} ({:.1}%)", format_bytes(savings), savings_percent);
    }
    
    Ok(())
}

async fn get_directory_size(dir: impl AsRef<Path>) -> Result<u64> {
    let mut total_size = 0;
    let mut stack = vec![dir.as_ref().to_path_buf()];
    
    while let Some(current_dir) = stack.pop() {
        let mut entries = tokio::fs::read_dir(&current_dir).await?;
        
        while let Some(entry) = entries.next_entry().await? {
            let path = entry.path();
            if path.is_file() {
                if let Ok(metadata) = tokio::fs::metadata(&path).await {
                    total_size += metadata.len();
                }
            } else if path.is_dir() {
                stack.push(path);
            }
        }
    }
    
    Ok(total_size)
}

fn format_bytes(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
    let mut size = bytes as f64;
    let mut unit_index = 0;
    
    while size >= 1024.0 && unit_index < UNITS.len() - 1 {
        size /= 1024.0;
        unit_index += 1;
    }
    
    if unit_index == 0 {
        format!("{} {}", bytes, UNITS[unit_index])
    } else {
        format!("{:.1} {}", size, UNITS[unit_index])
    }
} 