"use client";
import { useEffect, useState } from "react";

const useMobileView = () => {
    const [isMobileView, setIsMobileView] = useState();

    const handleResize = () => {
        setIsMobileView(window.innerWidth < 768);
    };

    useEffect(() => {
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return { isMobileView };
};

export default useMobileView;
