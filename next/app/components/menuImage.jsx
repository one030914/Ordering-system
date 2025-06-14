import { useState } from "react";

export default function MenuImage({ src, alt }) {
    const [imgError, setImgError] = useState(false);

    return (
        <>
            {!imgError ? (
                <Image
                    src={src}
                    alt={alt}
                    width={400}
                    height={250}
                    className="rounded-md w-full h-48 object-cover mb-4"
                    // onError={() => setImgError(true)}
                />
            ) : (
                <></>
                // <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-md mb-4 text-gray-500">
                //     無法載入圖片
                // </div>
            )}
        </>
    );
}
