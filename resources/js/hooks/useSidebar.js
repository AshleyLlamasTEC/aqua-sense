import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEY = 'sidebar-collapsed';
const MOBILE_BREAKPOINT = 768;

export const useSidebar = () => {
    const [state, setState] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return {
            isCollapsed: stored ? JSON.parse(stored) : false,
            isMobileOpen: false,
            isHovering: false,
        };
    });

    const [isMobile, setIsMobile] = useState(() => window.innerWidth < MOBILE_BREAKPOINT);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < MOBILE_BREAKPOINT;
            setIsMobile(mobile);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = useCallback(() => {
        setState(prev => {
            const newState = { ...prev, isCollapsed: !prev.isCollapsed };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newState.isCollapsed));
            return newState;
        });
    }, []);

    const toggleMobileSidebar = useCallback(() => {
        setState(prev => ({ ...prev, isMobileOpen: !prev.isMobileOpen }));
    }, []);

    return {
        ...state,
        isMobile,
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar: () => setState(prev => ({ ...prev, isMobileOpen: false }))
    };
};
