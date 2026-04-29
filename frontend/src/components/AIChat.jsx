import React, { useEffect, useState } from 'react';

const AIChat = () => {
    const [name, setName] = useState("User");
    const [messages,setMessages] = useState([]);
    const [input,setInput] = useState("");
    const [loading,setLoading] = useState(false);

    useEffect(() => {
       
        const storedUser=sessionStorage.getItem("user");
        if(storedUser){
            const user=JSON.parse(storedUser);
            setName(user.name?user.name.split(" ")[0]:"User");
        }
    }, []);

    const sendMessage=async()=>{
        if(!input.trim())return;

        const userMsg={sender:"user",text:input};
        setMessages(prev=>[...prev,userMsg]);
        setInput("");
        setLoading(true);

        try{
            const token=sessionStorage.getItem("token");
            const response=await fetch("http://localhost:8145/api/ai/chat",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    "Authorization":`Bearer ${token}`
                },
                body:JSON.stringify({message:input})
            });
            const data =await response.json();
            setMessages(prev=>[...prev,{sender:"ai",text:data.response}]);
        }catch(error){
            setMessages(prev=>[...prev,{sender:"ai",text:"Error in connecting with the AI"}])
        }finally{
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4 flex flex-col h-[80vh]">
                <h1 className="text-2xl font-bold mb-4 text-purple-700">Hi {name},Chat with AI </h1>

                <div className="flex-1 overflow-y-auto mb-4 bg-white p-4 rounded shadow border border-gray-200">
                    {messages.map((msg,i)=>(
                        <div key={i} className={`mb-2 p-2 rounded max-w-[80%] ${msg.sender==='user' ? 'bg-purple-100 ml-auto':'bg-gray-100'}`}>
                        <strong>{msg.sender==='user'?'You':'Gemini'}:</strong>{msg.text}
                        </div>
                    ))}
                    {loading && <p className="text-gray-500 italic">AI is Typing....</p>}
                    </div>

                    <div className="flex gap-2">
                        <input
                        type='text'
                        className='flex-1 p-2 border rounded'
                        value={input}
                        onChange={(e)=>setInput(e.target.value)}
                        onKeyDown={(e)=>e.key==='Enter' && sendMessage()}
                        placeholder='Ask Something....'
                        />
                        <button onClick={sendMessage} disabled={loading} className="bg-purple-600 text-white px-4 py-2 rounded">
                            Send
                        </button>
            </div>
        </div>
    );
};

export default AIChat;