import { shaderMaterial } from '@react-three/drei'
import { extend } from '@react-three/fiber'
import React, { useMemo } from 'react'
import { AdditiveBlending, BackSide, Color, DoubleSide, FrontSide } from 'three'

interface FakeGlowMaterialProps {
    /** Controls the value of the Falloff effect. Ranges from 0.0 to 1.0. */
    falloff?: number
    /** Controls the internal glow radius. Ranges from -1.0 to 1.0. Set a darker color to get the fresnel effect only. */
    glowInternalRadius?: number
    /** Specifies the color of the hologram. Use hexadecimal format. */
    glowColor?: string
    /** Specifies the edges sharpness. Defaults to 1.0. */
    glowSharpness?: number
    /** Specifies side for the material, as THREE.DoubleSide. Options are "THREE.FrontSide", "THREE.BackSide", "THREE.DoubleSide". Defaults to "THREE.FrontSide". */
    side?: typeof FrontSide | typeof BackSide | typeof DoubleSide
    /** Enable or disable depthTest. Defaults to false. */
    depthTest?: boolean
    /** Enable or disable depthWrite. Defaults to false. */
    depthWrite?: boolean
    /** Controls the opacity. Defaults to 1.0 */
    opacity?: number
}



// Declare the custom materials for TypeScript
// declare module '@react-three/fiber' {
//     interface ThreeElements {
//         fakeGlowMaterial: ThreeElement<typeof FakeGlowMaterial>
//     }
// }






const FakeGlowMaterial: React.FC<FakeGlowMaterialProps> = ({
    falloff = 0.1,
    glowInternalRadius = 6.0,
    glowColor = '#00ff00',
    glowSharpness = 1.0,
    side = FrontSide,
    depthTest = true,
    depthWrite = false,
    opacity = 1.0,
}) => {
    const FakeGlowMaterialImpl = useMemo(() => {
        return shaderMaterial(
            {
                falloffAmount: falloff,
                glowInternalRadius: glowInternalRadius,
                glowColor: new Color(glowColor),
                glowSharpness: glowSharpness,
                opacity: opacity,
            },
            /*GLSL */
            `
      varying vec3 vPosition;
      varying vec3 vNormal;

      void main() {
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        gl_Position = projectionMatrix * viewMatrix * modelPosition;
        vec4 modelNormal = modelMatrix * vec4(normal, 0.0);
        vPosition = modelPosition.xyz;
        vNormal = modelNormal.xyz;

      }`,
            /*GLSL */
            ` 
      uniform vec3 glowColor;
      uniform float falloffAmount;
      uniform float glowSharpness;
      uniform float glowInternalRadius;
      uniform float opacity;

      varying vec3 vPosition;
      varying vec3 vNormal;

      void main()
      {
        // Normal
        vec3 normal = normalize(vNormal);
        if(!gl_FrontFacing)
            normal *= - 1.0;
        vec3 viewDirection = normalize(cameraPosition - vPosition);
        float fresnel = dot(viewDirection, normal);
        fresnel = pow(fresnel, glowInternalRadius + 0.1);
        float falloff = smoothstep(0., falloffAmount, fresnel);
        float fakeGlow = fresnel;
        fakeGlow += fresnel * glowSharpness;
        fakeGlow *= falloff;
        gl_FragColor = vec4(clamp(glowColor * fresnel, 0., 1.0), clamp(fakeGlow, 0., opacity));

        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
        )
    }, [falloff, glowInternalRadius, glowColor, glowSharpness, opacity])

    extend({ FakeGlowMaterial: FakeGlowMaterialImpl })

    return (
        <fakeGlowMaterial
            key={FakeGlowMaterialImpl.key}
            side={side}
            transparent={true}
            blending={AdditiveBlending}
            depthTest={depthTest}
            depthWrite={depthWrite}
        />
    )
}

export { FakeGlowMaterial }
