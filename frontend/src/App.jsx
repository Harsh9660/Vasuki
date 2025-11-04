import React, {useState, useEffect, useRef} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function App(){
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const chatContainerRef = useRef(null);

  useEffect(() => {
    
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  async function send() {
    if(!message) return

    const history = messages.map(m => ({
      role: m.from === 'you' ? 'user' : 'assistant',
      content: m.text
    }));

    const userMsg = {from: 'you', text: message};
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setMessage("")
    setLoading(true)

   
    setMessages(prev => [...prev, {from: 'vasuki', text: '...'}]);

    try{
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({message, history, stream: true})
      })

      if (!res.body) return;

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        setMessages(prev => {
          const lastMsgIndex = prev.length - 1;
          const updatedMessages = [...prev];
          updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], text: fullResponse };
          return updatedMessages;
        });
      }

    }catch(err){
      setMessages(prev => {
        const lastMsgIndex = prev.length - 1;
        const updatedMessages = [...prev];
        updatedMessages[lastMsgIndex] = { ...updatedMessages[lastMsgIndex], text: 'Error contacting backend' };
        return updatedMessages;
      });
    }finally{
      setLoading(false)
    }
  }

  function onKey(e){
    if(e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="container">
      <h1>Vasuki Chat</h1>
      <div className="chat" ref={chatContainerRef}>
        {messages.length === 0 && <div className="hint">Say hi to Vasuki</div>}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.from}`}>
            <div className="bubble">
              {m.text === '...' ? <div className="typing-indicator"><span></span><span></span><span></span></div> : <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>}
            </div>
          </div>
        ))}
      </div>
      <div className="composer">
        <textarea value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={onKey} placeholder="Type a message (Shift+Enter for new line)" />
        <button onClick={send} disabled={loading}>{loading ? '...' : 'Send'}</button>
      </div>
    </div>
  )
}
