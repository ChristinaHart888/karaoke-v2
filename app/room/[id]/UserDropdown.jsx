import React, { useState } from "react";

export default function UserDropdown({ member }) {
    const [isExpanded, setIsExpanded] = useState(false);
    return (
        <div
            style={{
                color: "white",
                margin: "0.5em 1em",
                borderBottom: "1px solid black",
                padding: "0.5em",
                cursor: "pointer",
            }}
            onClick={() => setIsExpanded((prev) => !prev)}
        >
            {member.username} ({member.playlist ? member.playlist.length : 0})
            {isExpanded && (
                <div className="playlist">
                    {member.playlist?.length > 0 &&
                        member.playlist.map((song, index) => {
                            return (
                                <div key={song.title}>
                                    {index}
                                    {song.title}
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
