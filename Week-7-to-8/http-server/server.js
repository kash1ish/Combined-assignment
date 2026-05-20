// start creating server here
import http from "http";
import fs from "fs";

let todos = [];

const server = http.createServer((req, res)=>{
    
    const myUrl = new URL(req.url, `https://${req.headers.host}`);
    const method = req.method;

    if(myUrl.pathname === "/" && method === "GET"){
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json")
        res.end("Hello World");
    }
    else if(myUrl.pathname === "/create/todo" && method === "POST"){
        let body ="";

        try{
            req.on("data",(chunk)=>{
            body += chunk.toString();
        })

        req.on("end", ()=>{
            const parsedData = JSON.parse(body);

            //read file data
            const fileData = fs.readFileSync("todos.json", "utf-8");
            const todos = JSON.parse(fileData)

            const newId = todos.length > 0 ? todos[todos.length - 1].id + 1 : 1;
            const newTodo = {
                id: newId,
                title: parsedData.title,
                description: parsedData.description,
            }
            todos.push(newTodo);

            //save into file
            fs.writeFileSync("todos.json", JSON.stringify(todos, null, 2));
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify(todos));
        })
        }catch(error){
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json")
            res.end("Invalid JSON");
        }
    }

    else if(myUrl.pathname === "/todos" && method === "GET"){
        const fileData = fs.readFileSync("todos.json","utf-8");
        console.log(fileData)
        res.setHeader("Content-Type", "application/json")
        res.end(fileData);
    }

    else if(myUrl.pathname === "/todo" && method === "GET"){
        const id = myUrl.searchParams.get("id");
        const fileData = fs.readFileSync("todos.json", "utf-8");
        const todos = JSON.parse(fileData);
        const result = todos.find((todo) => todo.id == id);

        if(!result){
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({
                error: "Todo not found",
            }))
        }
        else{
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(result));
        }
    }

    else if(myUrl.pathname === "/todo" && method === "DELETE"){
        const id = myUrl.searchParams.get("id");
        const fileData = fs.readFileSync("todos.json", "utf-8");
        const todos = JSON.parse(fileData);
        
        const result = todos.filter((todo) => todo.id != id)
        if(result.length === todos.length){
            res.statusCode =  404;
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify({
                error: "Todo not found"
            }))
        }
        else{
            fs.writeFileSync("todos.json", JSON.stringify(result, null, 2))
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json")
            res.end(JSON.stringify(result));
        }
    }
})

server.listen(3000);