import { useState } from "react";
import { Assistant } from "./assistants/googleai";
import { Loader } from "./components/Loader/Loader";
import {Messages} from "./components/Messages/Messages";
import { Controls } from "./components/Controls/Controls";
import styles from "./App.module.css";

const CHATS = [
  {
    id: 1,
    title: "How to use AI Tools API in React Application",
    messages: [
      { role: "user", content: "How to use AI Tools API in React Application?" },
      { role: "assistant", content: "Hi! can you tell me which api you want to use in React application?" },
    ],


  },
  {
    id: 2,
    title: "Gemini AI vs ChatGPT",
      messages: [
      { role: "user", content: "How to use AI Tools API in React Application?" },
      { role: "assistant", content: "Hi! Can you explain for what type of task you will use it?" , },
    ],

  },
  
];





function App() {
  const assistant = new Assistant();
  const [messages, setMessages] = useState([]);
  const [isLoading , setIsLoading] = useState(false);
  const [chats , setChats]= useState(CHATS);
  const [activeChatID, setActiveChatID] = useState(1);
  const activeChatMessages= chats.find(( {id}) => id === activeChatID)?.messages ?? [];

  const [isStreaming, setIsStreaming] = useState(false);
  function updateLastMessageContent(content) {
    setMessages((prevMessages) =>
      prevMessages.map((message, index) =>
        index === prevMessages.length - 1
          ? { ...message, content: `${message.content}${content}` }
          : message
      )
    );
  }

  function addMessage(message) {
    setMessages((prevMessages) => [...prevMessages, message]);
  }

  async function handleContentSend(content) {
    addMessage({ content, role: "user" });
    setIsLoading(true);
    try {
      const result = await assistant.chatStream(content, messages);
      let isFirstChunk = false;

      for await (const chunk of result) {
        if (!isFirstChunk) {
          isFirstChunk = true;
          addMessage({ content: "", role: "assistant" });
          setIsLoading(false);
          setIsStreaming(true);
        }

        updateLastMessageContent(chunk);
      }

      setIsStreaming(false);
    } catch (error) {
      addMessage({
        content: "Sorry, I couldn't process your request. Please try again!",
        role: "system",
      });
      setIsLoading(false);
      setIsStreaming(false);
    }
  }



  return (
    <div className={styles.App}>
     { isLoading && <Loader />}
      <header className={styles.Header}>
        <img className={styles.Logo} src="/robot-assistant.png" />
        <h2 className={styles.Title}>QueryBot</h2>
      </header> 
      <div className={styles.Content}>
     

      <main className={styles.Main}>
        <div className={styles.ChatContainer}>
        <Messages messages={messages} />
      </div>
      <Controls isDisabled={isLoading || isStreaming} onSend={handleContentSend} />
      </main>
   </div>
  </div>
  );
}

export default App;