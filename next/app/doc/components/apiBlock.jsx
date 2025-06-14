import JsonBlock from "./jsonBlock";
import RestfulBadge from "./restfulBadge";
import UrlBadge from "./urlBadge";

export default function ApiBlock({
    apiName,
    apiDescription,
    bodyDescription,
    responseDescription,
    apiType,
    apiUrl,
    authorizationList,
    bodyObj,
    responseObj,
}) {
    const autoLink = (str, display) => {
        return str.replace(
            /(https:\/\/[^\s]+)/g,
            `<a href="$1" target="_blank" rel="noopener noreferrer" style="color: #3b82f6;">${display}</a>`
        );
    };

    return (
        <div className="mb-20">
            <div className="text-2xl mb-4">{apiName}</div>
            {apiDescription && <div className="mb-4">{apiDescription}</div>}
            <RestfulBadge type={apiType} />
            <span className="mr-1" />
            <UrlBadge text={apiUrl} />
            <div className="mb-4" />
            {authorizationList ? (
                <div className="mb-4">
                    權限：
                    {authorizationList.map((ele, idx) => {
                        return (
                            <span
                                key={idx}
                                className="px-2 py-1 rounded-md me-1"
                                style={{ background: "#e0e0e0" }}
                            >
                                {ele}
                            </span>
                        );
                    })}
                </div>
            ) : (
                <></>
            )}

            {bodyObj && (
                <>
                    <div className="my-4">Body:</div>
                    <JsonBlock jsonObj={bodyObj} />
                </>
            )}
            {bodyDescription && (
                <div className="mb-4">備註：{bodyDescription}</div>
            )}
            {responseObj && (
                <>
                    <div className="my-4">Response:</div>
                    <JsonBlock jsonObj={responseObj} />
                </>
            )}
            {responseDescription && (
                <div
                    className="mb-4"
                    dangerouslySetInnerHTML={{
                        __html: `備註：${autoLink(
                            responseDescription,
                            "連結"
                        )}`,
                    }}
                />
            )}
        </div>
    );
}
