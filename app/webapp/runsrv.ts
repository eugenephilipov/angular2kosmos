/// <reference path=""./../../../typings/index.d.ts"" />
import * as http from 'http'; // 1
import {server_play_figure} from '../services/server_play_figure'
import {server_send_player} from '../services/server_send_player'
import {server_player} from '../services/server_player'
//var body:any = [];
//request 
/*
kak sobratj setevoi luchemet v domashnih uslovijah 
1. app send init => server add game for 1st init and player figures and define 1 player for every init call, only leader update player figures 
2. app send not leader get it receives games_arr ind. on app side not leader updates all information but only own player
3. app send not leader set with delta , serer sude updates position of player and set only delta player figures
4. app send leader get it receives games_arr full version on app side all delta cleared on server side, it applies only delta and clear this tag 
5. app send leader set , serer side updates position of player and set player figures excluding mark as delta 
delta for player figure is visibility = false 

 after receiving get app updates positions only not local player

cla {
    constructor(parameters) {
        
    }
} 
*/
var games_arr:server_send_player[];
function get_err(err:string){
console.error(err);
}
function search_by_id_in_game(game_id:number,player_id:number):number{
    if (games_arr[game_id].players[0]!=undefined)
    for (let i=0;i<games_arr[game_id].players.length;i++){
        if ( games_arr[game_id].players[i].ind==player_id) return i;
    }
    return -1;
}
function search_by_name(str:string){
    if (games_arr!=undefined)
    for (let i=0;i<games_arr.length;i++){
        if (games_arr[i].players[0].server_marker==str) return i;
    }
    return -1;
}
function modify_game(user_resp:server_send_player,mode:string,no:number){
    let id:number;
    if (games_arr==undefined) games_arr=Array();
    if (mode=='add'){
        games_arr.push(new server_send_player());
        no=games_arr.length-1;
        games_arr[no].play_figures=Array();
        games_arr[no].players=Array();
    }    
    id=search_by_id_in_game(no,user_resp.players[0].ind);
    if (id<0){
        games_arr[no].players.push(new server_player());  
        id=games_arr[no].players.length-1;  
    }
    games_arr[no].players[id].ind=user_resp.players[0].ind;
	games_arr[no].players[id].coord_y	=	    user_resp.players[0].coord_y;
    games_arr[no].players[id].coord_x	=	    user_resp.players[0].coord_x;
    games_arr[no].players[id].current_source_index	=	    user_resp.players[0].current_source_index;
    games_arr[no].players[id].weapon_img	=	    user_resp.players[0].weapon_img;
    games_arr[no].players[id].weapon_coord_x	=	    user_resp.players[0].weapon_coord_x;
    games_arr[no].players[id].weapon_coord_y	=	    user_resp.players[0].weapon_coord_y;
    games_arr[no].players[id].weapon_length	=	    user_resp.players[0].weapon_length;
    games_arr[no].players[id].weapon_width	=	    user_resp.players[0].weapon_width;
    games_arr[no].players[id].weapon_visibility	=	    user_resp.players[0].weapon_visibility;
    games_arr[no].players[id].weapon_shift_left	=	    user_resp.players[0].weapon_shift_left;
    games_arr[no].players[id].weapon_shift_top	=	    user_resp.players[0].weapon_shift_top;
    games_arr[no].players[id].weapon_gan_bullets	=	    user_resp.players[0].weapon_gan_bullets;
    games_arr[no].players[id].total_scores	=	    user_resp.players[0].total_scores;
    games_arr[no].players[id].live_count	=	    user_resp.players[0].live_count;    
    games_arr[no].players[id].server_marker	=	    user_resp.players[0].server_marker;
    games_arr[no].players[id].server_leader	=	    user_resp.players[0].server_leader;
    games_arr[no].players[id].server_operation	=	    user_resp.players[0].server_operation;

    games_arr[no].players[id].blow_img=user_resp.players[0].blow_img;
    games_arr[no].players[id].blow_img_visibility=user_resp.players[0].blow_img_visibility;
    games_arr[no].players[id].blow_shift_left=user_resp.players[0].blow_shift_left;
    games_arr[no].players[id].blow_shift_top=user_resp.players[0].blow_shift_top;
    games_arr[no].players[id].blow_z_index=user_resp.players[0].blow_z_index;
    games_arr[no].players[id].blow_counter=user_resp.players[0].blow_counter;
    games_arr[no].players[id].blow_counter_setvalue=user_resp.players[0].blow_counter_setvalue;
    games_arr[no].players[id].blow_coord_x=user_resp.players[0].blow_coord_x;
    games_arr[no].players[id].blow_coord_y=user_resp.players[0].blow_coord_y;        
    games_arr[no].players[id].nonleader_live_count=user_resp.players[0].nonleader_live_count;
    games_arr[no].players[id].nonleader_total_scores=user_resp.players[0].nonleader_total_scores;       

    games_arr[no].players[id].nonleader_blow_coord_x=user_resp.players[0].nonleader_blow_coord_x;
    games_arr[no].players[id].nonleader_blow_coord_y=user_resp.players[0].nonleader_blow_coord_y;        
    games_arr[no].players[id].nonleader_blow_img_visibility=user_resp.players[0].nonleader_blow_img_visibility;
    games_arr[no].players[id].nonleader_blow_counter=user_resp.players[0].nonleader_blow_counter;

    games_arr[no].players[id].display_height=user_resp.players[0].display_height;
    games_arr[no].players[id].display_width=user_resp.players[0].display_width;


    let p_ind:number;
    let skip_leading:boolean;
    let koef_x:number;
    let koef_y:number;

    

    if (user_resp.players[0].server_leader==true || (user_resp.players[0].server_leader==false && user_resp.players[0].server_operation=='set' ))
    for (let i=0;i<user_resp.play_figures.length;i++){
        skip_leading=false;
        if (mode=='add') games_arr[no].play_figures.push(new server_play_figure);
        if  (user_resp.players[0].server_leader==false && user_resp.play_figures[i].is_used_delta==false) skip_leading=true;
        if (!skip_leading){       
            games_arr[no].play_figures[i].ind=user_resp.play_figures[i].ind;
            games_arr[no].play_figures[i].visibility=user_resp.play_figures[i].visibility;
            games_arr[no].play_figures[i].current_source_index=user_resp.play_figures[i].current_source_index;
            games_arr[no].play_figures[i].status=user_resp.play_figures[i].status;
            games_arr[no].play_figures[i].coord_x=user_resp.play_figures[i].coord_x;
            games_arr[no].play_figures[i].coord_y=user_resp.play_figures[i].coord_y;
            games_arr[no].play_figures[i].is_used_delta=user_resp.play_figures[i].is_used_delta;
        }
        //        
    }
    //games_arr.push(user_resp);
	return no;    
} 
function add_new_game(user_resp:server_send_player):number{// add new game by
    let ind:number=modify_game(user_resp,'add',0);
    return ind;
}
function check_header(user_resp:server_send_player):number{// main function which decodes what to do
   // console.log('started');
    let ind:number=search_by_name(user_resp.players[0].server_marker); 
	if (ind==-1) ind=add_new_game(user_resp);
    else{
         switch (user_resp.players[0].server_operation){
             case 'set': modify_game(user_resp,'',ind);
             case 'init': modify_game(user_resp,'',ind);
         }        
    }
    return ind;
}
function update_by_leader_data(user_resp:server_send_player,ind:number){
    modify_game(user_resp,'',ind);    	
}
function update_by_leading(user_resp:server_send_player,ind:number){
	modify_game(user_resp,'',ind);
}
function clear_delta(no:number){
    for (let i=0;i<games_arr[no].play_figures.length;i++){
         games_arr[no].play_figures[i].is_used_delta=false;
    }
}

/*
*/
const server = http.createServer((request, response)=> {
var body:any = [];
     
request.on('error', get_err ).on('data',  (chunk:any)=>{body.push(chunk);}) .on('end', ()=> {
//body = Buffer.concat(body).toString();
// BEGINNING OF NEW STUFF

response.on('error', get_err);

let ret_str:string='';
for (let i=0;i<body.length;i++){
    ret_str=ret_str+body[i];     
}

var jsonObject : any;
let ind:number;
//console.log(ret_str);
if (ret_str!=''){
jsonObject=JSON.parse(ret_str);
//console.log('b');
//console.log('yy'+JSON.stringify(jsonObject));
ind=check_header(jsonObject.server_send_player);
response.writeHead(200, {'Content-Type': 'text/plain','Access-Control-Allow-Origin':'*'});
//response.writeHead(200,'Access-Control-Allow-Origin','*');
let oper:string=jsonObject.server_send_player.players[0].server_operation;
let obj:any= {};
if (oper=='get') {
    response.end(JSON.stringify({data:games_arr[ind]}));
    if (jsonObject.server_send_player.players[0].server_leader) clear_delta(ind);
}
if (oper=='set' || oper=='init') 
//response.end('{data:true}');
//obj={server_send_player:};
response.end(JSON.stringify({data:games_arr[ind]}));
}
else {
response.writeHead(200, {'Content-Type': 'text/plain','Access-Control-Allow-Origin':'*'});
//response.writeHead(200,'Access-Control-Allow-Origin','*');
response.end('{none}');
}
}) //end function 

});

const port = 8080;
server.listen(port,'0.0.0.0'); // 2
console.log('Listening on http://169.254.102.84:' + port);