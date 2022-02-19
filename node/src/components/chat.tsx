import React, { ReactElement, useRef } from 'react'
import { List, ListItem, ListItemText, Box, Input, Button} from '@mui/material';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

export class ChatLog {
    name: string;
    content: string;
    name_color: string;
    constructor(name: string, content: string, name_color: string) {
        this.name = name
        this.content = content
        this.name_color = name_color
    }
}

export function Chat(props: {logs: ChatLog[], onSend: (content: string) => void}) {
    const virtuoso = useRef<VirtuosoHandle>(null);
    const clickevent = () => {
        const element = document.getElementById("chat-input") as HTMLInputElement;
        props.onSend(element.value);
        element.value = "";
    }
    const enterevent = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if(event.code == "Enter") {
            const element = document.getElementById("chat-input") as HTMLInputElement;
            props.onSend(element.value);
            element.value = "";
        }
    }
    return (
        <Box sx={{ display: 'flex', height: "100%", flexDirection: 'column'}}>
            <Box sx={{ height: "95%"}}>
                <Virtuoso 
                    data={props.logs}
                    style={{ height: "100%" }}
                    ref={virtuoso}
                    itemContent={(index, log) => {
                        return ( 
                                <ListItem key={index} divider={true}>
                                    <ListItemText primary={log.name} secondary={log.content} secondaryTypographyProps={{
                                        sx: {
                                            color: log.name_color,
                                            fontWeight: "bold"
                                        }
                                    }}/>
                                </ ListItem>
                        )
                    }}
                />
            </Box>
            <Box sx={{ height: "5%" }}>
                <div style={{textAlign: "center", marginTop: "1%"}}>
                    <span style={{margin: "3px"}}>
                        <input id="chat-input" type="text" style={{height: "24px", width: "80%"}} onKeyPress={enterevent}></input>
                    </span>
                    <span style={{margin: "3px"}}>
                        <Button variant="contained" onClick={clickevent}>送信</Button>
                    </span>
                </div>
            </Box>
        </Box>
    )
}