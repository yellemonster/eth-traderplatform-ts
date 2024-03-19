//
//
//
import { Server, Socket } from "socket.io";
//
import { RES, RT, T } from "../../__PKG__/X";
//
//
interface Connection {
    id: string;
    socket: Socket;
}
//
//
export class SocketIOServer {
    //
    //
    private io: Server;
    private connections: Map<string, Connection>;
    //
    //
    constructor(server: any, options: any) {
        this.connections = new Map();
        this.io = new Server<T.ClientEmits, T.ServerEmits>(server, options);
    }
    public setupEventHandlers(): void {
        //
        this.io.on(RT.SX.connection, (socket: Socket) => {
            //
            this.connections.set(socket.id, { id: socket.id, socket });
            //
            INIT(this.io, socket, this.connections);
        });
    }
}
//
//
function INIT(io: Server, socket: Socket, connections: Map<string, Connection>) {
    //
    socket.on(RT.SX.test, async () => {
        DebugConnections(socket, connections);
    });
    socket.on(RT.SX.disconnect, () => {
        Disconnect(socket, connections);
    });
}
//
//
function EnterAndExit(
    socket: Socket,
    user_id: string,
    exit_room_id: string,
    join_room_id: string
) {
    if (exit_room_id && user_id) {
        socket.leave(exit_room_id);
    }
    if (join_room_id && user_id) {
        socket.join(join_room_id);
    }
}
function Disconnect(socket: Socket, conns: Map<string, Connection>) {
    conns.delete(socket.id);
    // console.log(`\n*** >>> Socket ${socket.handshake.query.user_id}: [closed]\n`);
}
function DebugConnections(socket: Socket, conns: Map<string, Connection>) {
    console.log(
        "\n----------------------------------------------------------------------"
    );
    console.log("\n*** >>> Debugging client\n");
    console.log(">>> Active connections:");
    conns.forEach((c) => {
        console.log({
            socketID: c.socket.id,
            user_id: c.socket.handshake.query.user_id,
        });
    });
    //
    const userAlerts: RES.UserAlert[] = [
        {
            header: "Your server connection is active",
            details: [
                "Everthing appears to be working as intended",
                "If something seems awry, refresh the page (F5) to reload and reconnect fresh",
            ],
        },
    ];
    //
    socket.emit(RT.SX.test, { userAlerts });
}
async function User_socketId(io: Server, user_id: string) {
    //
    // console.log("\n\n\n***  >>>  get_user_socketId");
    //
    const allClients = await io.fetchSockets();
    //
    // console.log("\n\n\n***  >>>  allClients", allClients);
    //
    let socket_id: string = "null";
    //
    allClients.forEach((client) => {
        //
        const clientData = {
            user_id: client.handshake.query.user_id,
            socketId: client.id,
        };
        //
        if (clientData.user_id === user_id) {
            socket_id = clientData.socketId;
        }
    });
    //
    return socket_id;
}
function Send_userAlerts(userAlerts: RES.UserAlert[], socket: Socket) {
    if (userAlerts?.length > 0) {
        socket.emit(RT.SX.userAlert, { userAlerts });
    }
}
async function Send_directMsgs(directMsgs: RES.UserAlert[], io: Server) {
    if (directMsgs?.length > 0) {
        //
        const msgs: RES.UserAlert[] = [...directMsgs];
        //
        for (let i = 0; i < msgs.length; i++) {
            //
            if (msgs[i].user_id) {
                //
                const socket_id = await User_socketId(io, msgs[i].user_id!);
                //
                io.to(socket_id).emit(RT.SX.userAlert, {
                    userAlerts: [msgs[i]],
                });
            }
        }
    }
}
