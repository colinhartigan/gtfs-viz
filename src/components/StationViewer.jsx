import { useContext, useEffect, useMemo, useState } from "react";
import { GTFSContext } from "../contexts/GTFSContext";

import { Box, Center, Flex, HoverCard, Select, Table } from "@mantine/core";
import stops from "../assets/stops.txt";

export default function StationViewer({}) {
    const { addFile, GTFSdata } = useContext(GTFSContext);

    // load files
    useEffect(() => {
        addFile({ type: "add_stops_file", payload: stops });
    }, [addFile]);

    // parse out stops, platforms, etc
    const locations = useMemo(() => {
        let data = {
            stops: [],
            stations: {},
            entrances: [],
            nodes: [],
            boardingAreas: [],
        };

        GTFSdata?.stops?.forEach((stop) => {
            switch (stop.location_type) {
                case "0":
                    data.stops.push(stop);
                    break;
                case "1":
                    data.stations[stop.stop_id] = stop;
                    break;
                case "2":
                    data.entrances.push(stop);
                    break;
                case "3":
                    data.nodes.push(stop);
                    break;
                case "4":
                    data.boardingAreas.push(stop);
                    break;
            }
        });

        return data;
    }, [GTFSdata]);

    // load station stuff
    const [selectedStationId, setSelectedStationId] = useState("STN_B01_F01");
    const selectedStationData = useMemo(() => {
        if (!locations?.stations[selectedStationId]) return null;
        let data = {
            station: locations.stations[selectedStationId],
            stops: locations.stops.filter((stop) => stop.parent_station === selectedStationId),
            entrances: locations.entrances.filter((entrance) => entrance.parent_station === selectedStationId),
            nodes: locations.nodes.filter((node) => node.parent_station === selectedStationId),
        };
        data.boardingAreas = locations.boardingAreas.filter((boardingArea) => {
            boardingArea.parent_station in data.stops;
        });
        console.log(data);
        return data;
    }, [locations, selectedStationId]);

    const markers = useMemo(() => {
        if (!selectedStationData) return [];
        let items = [];

        const allnodes = selectedStationData.stops.concat(
            selectedStationData.entrances,
            selectedStationData.nodes,
            selectedStationData.boardingAreas
        );
        const minX = Math.min(...allnodes.map((stop) => stop.stop_lon));
        const maxX = Math.max(...allnodes.map((stop) => stop.stop_lon));
        const minY = Math.min(...allnodes.map((stop) => stop.stop_lat));
        const maxY = Math.max(...allnodes.map((stop) => stop.stop_lat));

        allnodes.forEach((node) => {
            const x = ((node.stop_lon - minX) / (maxX - minX)) * 500;
            const y = ((node.stop_lat - minY) / (maxY - minY)) * 500;
            items.push({ x, y, data: node });
        });

        return items;
    }, [selectedStationData]);

    /*
        Location type. Valid options are:

        0 (or empty) - Stop (or Platform). A location where passengers board or disembark from a transit vehicle. Is called a platform when defined within a parent_station.
        1 - Station. A physical structure or area that contains one or more platform.
        2 - Entrance/Exit. A location where passengers can enter or exit a station from the street. If an entrance/exit belongs to multiple stations, it may be linked by pathways to both, but the data provider must pick one of them as parent.
        3 - Generic Node. A location within a station, not matching any other location_type, that may be used to link together pathways define in pathways.txt.
        4 - Boarding Area. A specific location on a platform, where passengers can board and/or alight vehicles.
        */

    /*
        - Stop/platform (location_type=0): the parent_station field contains the ID of a station.
        - Station (location_type=1): this field must be empty.
        - Entrance/exit (location_type=2) or generic node (location_type=3): the parent_station field contains the ID of a station (location_type=1)
        - Boarding Area (location_type=4): the parent_station field contains ID of a platform.
        */

    return (
        <>
            <Flex direction='column' h='100%' w='100%' justify='center' align='center' p='lg' gap='md'>
                <Select
                    searchable
                    w='400px'
                    label='Station'
                    data={Object.values(locations.stations).map((station) => ({
                        value: station.stop_id,
                        label: station.stop_name,
                    }))}
                    value={selectedStationId}
                    onChange={(value) => {
                        console.log(value);
                        setSelectedStationId(value);
                    }}
                />
                <Center w='550px' h='550px' pos='relative' className='border-gray-600 rounded-md border-2 border-solid'>
                    <Box w='500px' h='500px' pos='relative'>
                        {markers &&
                            markers.map((marker) => {
                                return (
                                    <HoverCard key={marker.data.stop_id}>
                                        <HoverCard.Target>
                                            <Box
                                                pos='absolute'
                                                top={marker.y}
                                                left={marker.x}
                                                w='5px'
                                                h='5px'
                                                className='rounded-full'
                                                bg={
                                                    marker.data.location_type === "0"
                                                        ? "blue.2"
                                                        : marker.data.location_type === "1"
                                                        ? "green.2"
                                                        : marker.data.location_type === "2"
                                                        ? "orange.2"
                                                        : marker.data.location_type === "3"
                                                        ? "violet.2"
                                                        : "yellow.2"
                                                }
                                            />
                                        </HoverCard.Target>
                                        <HoverCard.Dropdown>
                                            <Table variant='vertical' size='xs'>
                                                <Table.Tbody>
                                                    {Object.entries(marker.data).map(([key, value]) => {
                                                        return (
                                                            <Table.Tr key={key}>
                                                                <Table.Td>{key}</Table.Td>
                                                                <Table.Td>{value}</Table.Td>
                                                            </Table.Tr>
                                                        );
                                                    })}
                                                </Table.Tbody>
                                            </Table>
                                        </HoverCard.Dropdown>
                                    </HoverCard>
                                );
                            })}
                    </Box>
                </Center>
            </Flex>
        </>
    );
}
