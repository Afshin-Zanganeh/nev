import { useEffect, useRef, useState } from "react";
import Scene from './components/Scene/Scene';
import type { TableEntriesForTreeNodesQuery, TreeForTableQuery, TableEntriesForTreeNodesResponse, TreeForTableResponse } from "./types/types";
import type { RuleNodeData, TreeNodeData } from "./data/TreeNodeData";
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { nanoid } from 'nanoid';

function App() {
  const bcRef = useRef<BroadcastChannel | null>(null);
  const [id] = useState(nanoid());
  const [message, setMessage] = useState<{ nemoId: String, responseType: string, payload: TableEntriesForTreeNodesResponse | TreeForTableResponse } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backdropOpen, setBackdropOpen] = useState(true);

  useEffect(() => {
    const bc = new BroadcastChannel("NemoVisualization");
    bcRef.current = bc;

    bc.addEventListener("message", event => {
      console.log("Received:", event.data);
      
      setBackdropOpen(false);
      
      if (event.data.id === id) {
        if (event.data.error) {
          setError(event.data.error);  
        } else {
          setMessage(event.data);
          console.log(message?.nemoId)
        }
      }
    });

    return () => bc.close();
  }, [id]);

  const sendMessage = (msg: { queryType: string, payload: TableEntriesForTreeNodesQuery | TreeForTableQuery | { id:number } }) => {
    const params = new URLSearchParams(window.location.search);
    const idmsg = { 
      id,
      nemoId: message?.nemoId || params.get("nemoId"),
      queryType: msg.queryType, 
      payload: msg.payload, 
    };
    console.log(`Sent ${msg.queryType === "treeForTable" ? 'Type 1' : 'Type 2' }: `, idmsg);
    bcRef.current?.postMessage(idmsg);
    setBackdropOpen(true);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const predicate = params.get("predicate");
    const query = params.get("query");

    if (!predicate || !query) return;
    let queries: string[] = [];
    try {
      const arr = JSON.parse(query);
      queries = Array.isArray(arr) ? arr.map(e => Array.isArray(e) ? e.join(",") : e) : [];
    } catch {
      console.error("Error parsing query:", query);
      return;
    }
    sendMessage({
      queryType: "treeForTable",
      payload: { predicate: predicate, tableEntries: { queries } }
    })
  }, []);

  const handleCodingButtonClicked = (node: RuleNodeData) => {
    sendMessage({
      queryType: "jumpToRule",
      payload: { id: node.ruleId.id }
    });
  }

  return (
    <div>
      <Scene 
        error={error}
        message={message} 
        sendMessage={sendMessage} 
        codingButtonClicked={handleCodingButtonClicked} 
      />
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={backdropOpen}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
}

export default App;