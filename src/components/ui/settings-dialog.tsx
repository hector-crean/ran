"use client"

import { Toggle } from "@/components/ui/toggle"
import { useSettings } from "@/contexts/settings-dialog"

import {
    Dialog,
    DialogContent,
    DialogTrigger
} from "@/components/ui/dialog"
import { GoGear } from "react-icons/go"
import { Button } from "./button"

const SettingsDialog = () => {


    const { settings, toggleSetting } = useSettings()


    return (
        <Dialog>

            <DialogTrigger asChild>
                <Button
                    size="icon"
                    className="absolute top-4 right-4 z-50 rounded-full">
                    <GoGear size="100%" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <div className="flex flex-col gap-4 p-4 bg-gradient-to-br from-[oklch(0.8197_0.0558_247.67)] via-[oklch(0.8117_0.0576_250.16)] to-[oklch(0.8164_0.042_271.81)] rounded-l-md">
                    <div className="flex justify-center items-center py-2 text-white border-b border-white">
                        <h2>Settings</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                        {Object.entries(settings).map(([key, setting]) => (
                            <div key={key} className="flex justify-between items-center py-2 text-white gap-8">
                                <span>{key}</span>
                                <Toggle isOn={setting.enabled} onClick={() => toggleSetting(key)} />
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>



        </Dialog>
    )
}

export default SettingsDialog