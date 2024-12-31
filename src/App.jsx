import { Box, createTheme, MantineProvider } from "@mantine/core";

import StationViewer from "./components/StationViewer";
import GTFSProvider from "./contexts/GTFSProvider";

function App() {
    const theme = createTheme({
        fontFamily: "Helvetica, sans-serif",
        primaryColor: "blue",
    });

    return (
        <>
            <MantineProvider theme={theme} defaultColorScheme='dark'>
                <GTFSProvider>
                    <Box miw='100vw' mih='100vh' w='100vw' h='100vh'>
                        <StationViewer />
                    </Box>
                </GTFSProvider>
            </MantineProvider>
        </>
    );
}

export default App;
