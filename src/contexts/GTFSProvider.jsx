import { useCallback, useReducer } from "react";
import { usePapaParse } from "react-papaparse";
import { GTFSContext } from "./GTFSContext";

export default function GTFSProvider({ children }) {
    const { readString } = usePapaParse();

    const addFile = useCallback(
        async (file) => {
            const resp = await fetch(file.payload);
            const text = await resp.text();

            readString(text, {
                header: true,
                worker: true,
                complete: (result) => {
                    dispatchGTFS({ type: file.type, data: result.data });
                },
            });
        },
        [readString]
    );

    const [GTFSdata, dispatchGTFS] = useReducer((state, action) => {
        if (action.type === "add_stops_file") {
            return { ...state, stops: action.data };
        }
        if (action.type === "add_levels_file") {
            return { ...state, levels: action.data };
        }
        if (action.type === "add_trips_file") {
            return { ...state, trips: action.data };
        }
    }, {});

    return (
        <>
            <GTFSContext.Provider value={{ addFile, GTFSdata }}>{children}</GTFSContext.Provider>
        </>
    );
}
