import { useRef, useState, useEffect } from "react";
import { UploadWidgetValue } from "@/types";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, BACKEND_BASE_URL } from "@/constants";

interface UploadWidgetProps {
    value?: UploadWidgetValue | null;
    onChange: (file: UploadWidgetValue | null) => void;
    disabled?: boolean;
}

const UploadWidget = ({ value = null, onChange, disabled = false }: UploadWidgetProps) => {
    const widgetRef = useRef<CloudinaryWidget | null>(null);
    const onChangeRef = useRef(onChange);

    const [preview, setPreview] = useState<UploadWidgetValue | null>(value);
    const [isRemoving, setIsRemoving] = useState(false);

    useEffect(() => {
        setPreview(value);
    }, [value]);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const initializeWidget = () => {
            if (!window.cloudinary || widgetRef.current) return false;

            widgetRef.current = window.cloudinary.createUploadWidget({
                cloudName: CLOUDINARY_CLOUD_NAME,
                uploadPreset: CLOUDINARY_UPLOAD_PRESET,
                multiple: false,
                folder: 'uploads',
                maxFileSize: 5000000,
                clientAllowedFormats: ['png', 'jpg', 'jpeg', 'webp']
            }, (error, result) => {
                if (!error && result.event === 'success') {
                    const payload: UploadWidgetValue = {
                        url: result.info.secure_url,
                        publicId: result.info.public_id,
                    }
                    setPreview(payload);
                    onChangeRef.current?.(payload);
                }
            });
            return true;
        }

        if (initializeWidget()) return;

        const intervalId = window.setInterval(() => {
            if (initializeWidget()) {
                window.clearInterval(intervalId)
            }
        }, 500)
        return () => window.clearInterval(intervalId)
    }, [])

    const openWidget = () => {
        if (!disabled) widgetRef.current?.open();
    };

    const removeFromCloudinary = async () => {
        if (!preview || isRemoving) return;

        setIsRemoving(true);
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/uploads/${encodeURIComponent(preview.publicId)}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete image from Cloudinary');
            }

            setPreview(null);
            onChangeRef.current?.(null);
        } catch (error) {
            console.error('Error removing image:', error);
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <div className="space-y-2">
            {preview ? (
                <div className="upload-preview relative">
                    <img src={preview.url} alt="uploaded file" />
                    <button
                        type="button"
                        onClick={removeFromCloudinary}
                        disabled={disabled || isRemoving}
                        className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 disabled:opacity-50"
                        aria-label="Remove image"
                    >
                        {isRemoving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <X className="h-4 w-4" />
                        )}
                    </button>
                </div>
            ) : (
                <div
                    className="upload-dropzone"
                    role="button"
                    tabIndex={0}
                    onClick={openWidget}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            openWidget();
                        }
                    }}
                >
                    <div className="upload-prompt">
                        <UploadCloud className="icon" />
                        <div>
                            <p>Click to upload photo</p>
                            <p>PNG, JPG up to 5MB</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UploadWidget;