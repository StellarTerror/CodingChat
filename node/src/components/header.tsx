import React from 'react'
import { AppBar, Toolbar, ThemeProvider, createTheme, Typography, Button, Select, MenuItem, SelectChangeEvent} from '@mui/material'
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#1976d2',
      },
    },
  });

export function Header(props: {language_change: (language: string) => void, is_running: boolean, run_code: () => void}) {
    var run_button = props.is_running ? <Button color="inherit" disabled={true} sx={{margin: "5px"}}>実行中...</Button> : <Button color="inherit" onClick={props.run_code} sx={{margin: "5px"}}><ArrowRightIcon />実行</Button>
    return (
        <ThemeProvider theme={darkTheme}>
            <AppBar position="sticky">
                <Toolbar>
                    <Typography variant="h6" component="div" style={{ flex: 1 }}>
                        CodingChat
                    </Typography>
                    <Select
                    defaultValue={"cpp"}
                    displayEmpty
                    onChange={(event: SelectChangeEvent) => props.language_change(event.target.value as string)}
                    >
                        <MenuItem value="cpp">C++</MenuItem>
                        <MenuItem value="python">Python3</MenuItem>
                    </Select>
                    {run_button}
                    <Button color="inherit" onClick={() => window.location.href = "/"} sx={{margin: "5px"}}>退室</Button>
                </Toolbar>
            </AppBar>
        </ThemeProvider>
    )
}