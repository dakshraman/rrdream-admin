"use client";
import { createContext, useContext, useState, useEffect } from "react";

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children }) => {
    const [searchFilters, setSearchFilters] = useState({});
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedFilters = localStorage.getItem("searchFilters");
            if (savedFilters) {
                setSearchFilters(JSON.parse(savedFilters));
            }
        }
    }, []);
    const updateSearchFilters = (filters) => {
        setSearchFilters(filters);
        if (typeof window !== "undefined") {
            localStorage.setItem("searchFilters", JSON.stringify(filters));
        }
    };

    const removeSearchFilters = () => {
        if (typeof window === "undefined") return;
        localStorage.removeItem("searchFilters");
        setSearchFilters({});
    };
    return (
        <SearchContext.Provider value={{ searchFilters, updateSearchFilters, removeSearchFilters }}>
            {children}
        </SearchContext.Provider>
    );
};
