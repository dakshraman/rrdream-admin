"use client";
import { toast } from "react-hot-toast";
import { createContext, useContext, useEffect, useState } from "react";

const locationContext = createContext();

export const useCountry = () => useContext(locationContext);

export const CountryProvider = ({ children }) => {
  // ✅ Initialize state directly from localStorage or fallback
  const [countryDetails, setCountryDetails] = useState([]);
  useEffect(() => {
    const storedCountry = localStorage.getItem("country");

    if (storedCountry) setCountryDetails(JSON.parse(storedCountry));
  }, []);

  // ✅ Function to update country
  const updateCountry = (newCountry) => {
    // if (!newCountry?.CountryID || !newCountry?.CountryName) {
    //   toast.error("Invalid country details");
    //   return;
    // }
    const countryURL = newCountry.CountryNameURL || "/";
    const updated = [
      {
        CountryID: newCountry.CountryID,
        CountryName: newCountry.CountryName,
        CountryNameURL: countryURL,
      },
    ];
    setCountryDetails(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("country", JSON.stringify(updated));
    }
    toast.success(`Country updated to ${newCountry.CountryName}`);
  };



  const removeCountryFromStorage = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem("country");
  };
  return (
    <locationContext.Provider
      value={{ countryDetails, setCountryDetails, updateCountry, removeCountryFromStorage }}
    >
      {children}
    </locationContext.Provider>
  );
};