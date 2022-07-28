import {createServer} from 'node:http'
import {once } from 'node:events'


async function handler(request, response){
    try {
        //console.log(request.body)
        const data = JSON.parse(await once(request,'data'))
        console.log('\n received ',data)
        response.end(JSON.stringify(data))

        setTimeout(()=>{
            throw new Error('Will be handled on uncaught')
        },1000)

        Promise.reject('Wil be handled on uncaugth')
    } catch (error) {
        console.error('Deu ruin',error.stack )
        response.writeHead(500)
        response.end()
    }
}

const server = createServer(handler)
    .listen(3000)
    .on("listening", ()=> console.log("server running at 3000")
)

// Para capturar erros não tratados.
// Se não tiver ele o sistema quebra
process.on('uncaughtException',(erro,origin)=>{
    console.log(`\n ${origin} signal received \n ${erro}`)
})
// se não tiver o sistema joga um warm
process.on('unhandledRejection',(error)=>{
    console.log(`\n unhandledRejection  signal received \n ${error}`)
})

// Implementando o Gracefull shutdown

function gracefullShutdown(event){
    return (code )=>{
        console.log(`${event} received! with ${code}`)
        //garantimos que ninguem vai entrar nessa aplicação no periodo.
        // mas quem esta na transação temina o que esta fazendo.
        server.close(()=>{
            console.log('http server closed')
            console.log('DB connectio closed')
            process.exit(code)
        })
    }
}

//Aguardar as conexoes seremencerradas para depois encerar o programa
// disparado no CTRL+C
process.on('SIGINT',gracefullShutdown('SIGINT'))

//Aguardar as conexoes seremencerradas para depois encerar o programa
process.on('SIGTERM',gracefullShutdown('SIGTERM'))
process.on('exit',()=>{
    console.log("exit Sigint received! ", code)

})