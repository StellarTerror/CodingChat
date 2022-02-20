import React, { ReactElement, useRef } from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'

export class ChatLog {
    name: string;
    content: string;
    name_color: string;
    constructor(content: string, name: string, name_color: string) {
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
        <div style={{ display: 'flex', height: "100%", flexDirection: 'column'}}>
            <div style={{ height: "95%"}}>
                <Virtuoso 
                    data={props.logs}
                    style={{ height: "100%" }}
                    ref={virtuoso}
                    itemContent={(index, log) => {
                        return ( 
                                <div className="list-group-item">
                                    <p className="h5">{log.content}</p>
                                    <div style={{color: log.name_color}}>{log.name}</div>
                                </div>
                        )
                    }}
                />
            </div>
            <div style={{ height: "5%" }}>
                <div style={{textAlign: "center", marginTop: "1%"}}>
                    <span style={{margin: "3px"}}>
                        <input id="chat-input" type="text" style={{height: "24px", width: "80%"}} onKeyPress={enterevent}></input>
                    </span>
                    <span style={{margin: "3px"}}>
                        <button type="button" className="btn btn-primary" onClick={clickevent}>送信</button>
                    </span>
                </div>
            </div>
        </div>
    )
}