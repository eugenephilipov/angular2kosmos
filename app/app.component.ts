import { Component, trigger, style, ElementRef } from '@angular/core';

import {play_figure} from './models/play_figure'
import {play_man} from './models/play_man'
import {image_obj} from './models/image_obj'
import {game_service} from './services/game_service'
import {player_keyset} from "./models/player_keyset"
import {standard} from "./models/standard"
import {Directive,  Renderer} from '@angular/core';
import { Http, Response } from '@angular/http';
import {server_interaction} from './services/server_interaction'
import {server_return} from "./services/server_return";
import {server_send_player} from "./services/server_send_player";
import {server_play_figure} from "./services/server_play_figure";
import {server_player} from "./services/server_player";

import 'rxjs/add/observable/throw';

//Operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/toPromise';

@Component({
  selector: 'my-app',
  providers:[server_interaction],
  
  template: `<style>
      .movingr{
        position: absolute;                
      } 
      
      .m1{
        background-color:black;
      }
      .score_board{
        color:white; 
      }
      .inpform{
        left:300px;
        top:30px;
        position: absolute;    
      }
      .lb{
        color:white;
      }
      .score_board{
        margin: 0 0 0 0;
      }
      .maindiv{
        
        margin:0 0 0 0;
        position: absolute;
        background-color: rgb(36,28,28);
        overflow-x: hidden; 
        overflow-y: hidden;
      }
      .txtstyle{
        border: 2px solid yellow;
        margin:2 2 2 2;
      }
    </style>
    <div (window:keydown)="onkeydown($event)" (window:keyup)="onkeydown($event)" [style.left.px]="standard.def_left" [style.top.px]="standard.def_top" [style.width.px]="standard.right" [style.height.px]="standard.bottom" class="maindiv">
    <div class="inpform" [style.visibility]="input_form_visibility">
    <form #inputForm="ngForm" >
        <label for="network_game" class="lb" >network game</label>
        <input type="checkbox" id="network_game" name="network_game" ><br>      
        <label for="network_name" class="lb" >network name</label>
        <input type="text"  id="network_name" [(ngModel)]="server_marker" name="network_name" ><br>
        <label for="network_player_num" class="lb" >network player num/</label>
        <input type="text"  name="network_player_num" [(ngModel)]="input_form_num_plyer" ><br>        
        <button type="button" (click)="newGame()">Start</button>      
    </form>
    </div>             
    <p class="score_board" >игрок1 <img src="zhizn1.svg">{{player_figures[0].live_count}} oчки:{{player_figures[0].total_scores}}</p>
    <p *ngIf="!local_one_player" class="score_board" >игрок2 <img src="zhizn1.svg">{{player_figures[1].live_count}} oчки:{{player_figures[1].total_scores}}</p>
    <div *ngFor="let player_figure of player_figures"  [style.left.px]="player_figure.weapon_coord_x" [style.top.px]="player_figure.weapon_coord_y" class="movingr" [style.visibility]="player_figure.weapon_visibility" [style.z-index]="player_figure.man_play_figure.z_index"><img  src="{{player_figure.weapon_img}}"></div>
    <div *ngFor="let player_figure of player_figures"  [style.left.px]="player_figure.blow_coord_x" [style.top.px]="player_figure.blow_coord_y" class="movingr" [style.visibility]="player_figure.blow_img_visibility" [style.z-index]="player_figure.blow_z_index"><img  src="{{player_figure.blow_img}}"></div>    
        <div *ngFor="let meteor_play_figure of meteor_play_figures" class="movingr" id="{{meteor_play_figure.dom_id}}" [style.z-index]="meteor_play_figure.z_index" [style.left.px]="meteor_play_figure.coord_x" [style.top.px]="meteor_play_figure.coord_y" [style.bottom.px]="meteor_play_figure.bottom" [style.visibility]="meteor_play_figure.visibility">
        <img *ngIf="meteor_play_figure.element_type=='IMG'"  src="{{meteor_play_figure.image_sources[meteor_play_figure.current_source_index].source}}"  >
        <p *ngIf="meteor_play_figure.element_type=='TXT'" [class]="meteor_play_figure.txtstyle">{{meteor_play_figure.text_val}}</p>
      </div>
    </div>   
    `
    
})
export class AppComponent {
  //player_figure: play_man; 
  play_figures: play_figure[] = [
  ];
  values = '';//Math.floor(34/8);
  game_status = 1;
  meteor_count = 40;
  one_time_meteor_add_count = 5;
  step_counter: number = 1;
  meteor_play_figures: play_figure[];
  main_service: game_service;
  player_figures: play_man[];
  myElement:any;
  ret_arr:server_send_player;//server return 
  main_server_send_player:server_send_player;
  server_game:boolean=false;
  server_leader:boolean=false;
  server_marker:string='demo';  
  server_operation:string;
  server_player_ind:number;
  input_form_visibility:string='visible';
  input_form_num_plyer:any;
  standard:standard=new standard();  
  local_one_player:boolean=true;
  bam_sound=new Audio('bam.wav');
  bim_sound=new Audio('bim.wav');
  robot_init_marker:boolean=false;
  robot_laser_lifo:number[]=new Array();
  constructor(public el: ElementRef , public renderer: Renderer,private server_interaction:server_interaction ){
    //myElement.nativeElement.getElementsById();
    
    this.main_server_send_player=new server_send_player();
    
    //let http:Http=new Http('a','a')
    this.main_service = new game_service();
    this.player_figures = Array(new play_man(),new play_man());
    this.main_service.play_bg = new Audio('DX5.mp3');
    
    this.main_service.play_bg.play();
    this.player_figures[0].man_play_figure = new play_figure();
    //this.player_figures[0].man_play_figure.image_sources = [{ step_px: 25, width: 220, length: 70, event: 'move', source: 'kosmolet_b.svg', live_iter: 30, iteration_count: 0 , active_heigth:null  }, { step_px: 25, width: 220, length: 70, event: 'move', source: 'kosmolet_b2.svg', live_iter: 30, iteration_count: 0 , active_heigth:null  }];
    this.player_figures[0].man_play_figure.image_sources = [{ step_px: 25, width: 220, length: 70, event: 'move', source: 'kosmolet.svg', live_iter: 30, iteration_count: 0 , active_heigth:null  }, { step_px: 25, width: 220, length: 70, event: 'move', source: 'kosmolet2.svg', live_iter: 30, iteration_count: 0 , active_heigth:null  }];

    
    this.player_figures[0].man_play_figure.coord_x = 5;
    this.player_figures[0].man_play_figure.coord_y = 5;
    this.player_figures[0].man_play_figure.play_type = 'player';
    //this.player_figures[0].init_weapon_shift_top = 43;  
    //this.player_figures[0].init_weapon_shift_left = 220;
    this.player_figures[0].init_weapon_shift_top = 59;  
    this.player_figures[0].init_gun();
    this.player_figures[0].man_play_figure.z_index='100';
    this.player_figures[0].man_play_figure.dom_id='player0';
    
    

/*
    this.player_figures[0].weapon_img = 'laser.svg';
    this.player_figures[0].weapon_length = 7;
    this.player_figures[0].weapon_width = 191;
    this.player_figures[0].weapon_shift_left = 210;
    this.player_figures[0].weapon_shift_top = 63;
*/
    this.player_figures[0].man_play_figure.movement_type = 'keyset';

    this.player_figures[0].man_play_figure.keyset =new player_keyset(39, 37, 40, 38, 32); // new player_keyset(68,65,88,69,90);// 
    this.player_figures[0].gamepad=false;
    this.main_service.init_keymap(this.player_figures[0].man_play_figure.keyset);
    this.player_figures[0].server_send=false;
    

    this.player_figures[1].man_play_figure = new play_figure();
    this.player_figures[1].man_play_figure.image_sources = [{ step_px: 25, width: 220, length: 70, event: 'move', source: 'kosmolet_novij.svg', live_iter: 30, iteration_count: 0 , active_heigth:null  }];
    
//    this.player_figures[1].man_play_figure.image_sources = [{ step_px: 25, width: 220, length: 70, event: 'move', source: 'kosmolet.svg', live_iter: 30, iteration_count: 0 , active_heigth:null  }, { step_px: 25, width: 220, length: 70, event: 'move', source: 'kosmolet2.svg', live_iter: 30, iteration_count: 0 , active_heigth:null  }];
    
    this.player_figures[1].man_play_figure.coord_x = 15;
    this.player_figures[1].man_play_figure.coord_y = 105;
    this.player_figures[1].man_play_figure.play_type = 'player';
    this.player_figures[1].gamepad=false;
/*
    this.player_figures[1].weapon_img = 'laser.svg';
    this.player_figures[1].weapon_length = 7;
    this.player_figures[1].weapon_width = 191;
    this.player_figures[1].weapon_shift_left = 210;
    this.player_figures[1].weapon_shift_top = 63;
    */

    this.player_figures[1].init_weapon_shift_top = 43;  
    this.player_figures[1].init_weapon_shift_left = 220;  
    
    this.player_figures[1].init_gun();
    this.player_figures[1].man_play_figure.movement_type = 'keyset';
    //this.player_figures[1].man_play_figure.keyset = new player_keyset(39, 37, 40, 38, 32);
    this.player_figures[1].man_play_figure.keyset = new player_keyset(68,65,88,69,90);

    this.player_figures[1].man_play_figure.z_index='100';
    this.player_figures[1].man_play_figure.dom_id='player1';

    this.main_service.init_keymap(this.player_figures[1].man_play_figure.keyset);
    this.player_figures[1].server_send=true;

    this.meteor_play_figures = new Array(this.player_figures[0].man_play_figure, new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(),new play_figure(),new play_figure(), new play_figure(), new play_figure(), new play_figure(),  new play_figure(),new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure(), new play_figure()
    ,new play_figure(), new play_figure() , new play_figure() , new play_figure() , new play_figure() , new play_figure() 
    , new play_figure()
    );


    this.meteor_play_figures[1].image_sources = [{ step_px: 5, width: 40, length: 40, event: 'move', source: 'star_yellow.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[1].coord_x = 1100;
    this.meteor_play_figures[1].coord_y = 50;
    this.meteor_play_figures[1].play_type = 'flying_obj';
    this.meteor_play_figures[1].figure_outline = 'star';
    this.meteor_play_figures[1].dom_id = 'star1';
    
    
    this.meteor_play_figures[2].image_sources = [{ step_px: 5, width: 40, length: 40, event: 'move', source: 'star_yellow.svg', live_iter: 25, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[2].coord_x = 1000;
    this.meteor_play_figures[2].coord_y = 350;
    this.meteor_play_figures[2].play_type = 'flying_obj';
    this.meteor_play_figures[2].figure_outline = 'star';
    this.meteor_play_figures[2].dom_id = 'star2';

    this.meteor_play_figures[3].image_sources = [{ step_px: 35, width: 60, length: 35, event: 'move', source: 'inik.svg', live_iter: 25, iteration_count: 0 , active_heigth:null  }, { step_px: 35, width: 60, length: 35, event: 'move', source: 'inik2.svg', live_iter: 25, iteration_count: 0 , active_heigth:null  }, { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[3].coord_x = 1000;
    this.meteor_play_figures[3].coord_y = 250;
    this.meteor_play_figures[3].play_type = 'end';
    this.meteor_play_figures[3].figure_outline = 'star';
    this.meteor_play_figures[3].movement_type = 'cosinus';
    this.meteor_play_figures[3].dom_id = 'alien1';

    this.meteor_play_figures[4].image_sources = [{ step_px: 20, width: 124, length: 88, event: 'move', source: 'meteor3.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }, { step_px: 20, width: 124, length: 88, event: 'move', source: 'meteor4.svg', live_iter: 5, iteration_count: 0 , active_heigth:null  }, { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[4].coord_x = 1000;
    this.meteor_play_figures[4].coord_y = 150;
    this.meteor_play_figures[4].play_type = 'end';
    this.meteor_play_figures[4].figure_outline = 'star';
    this.meteor_play_figures[4].score = 50;
    this.meteor_play_figures[4].wait_iterations = 100;
    this.meteor_play_figures[4].dom_id = 'meteor';
//this.meteor_play_figures[4].movement_type = 'server';    

    this.meteor_play_figures[5].image_sources = [{ step_px: 5, width: 140, length: 180, event: 'move', source: 'mountain.svg', live_iter: 75, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[5].coord_x = 1200;
    //this.meteor_play_figures[5].coord_y = 460;
    this.meteor_play_figures[5].play_type = 'flying_obj';
    this.meteor_play_figures[5].figure_outline = 'star';
    this.meteor_play_figures[5].wait_iterations = 500;
    this.meteor_play_figures[5].dom_id = 'mountain';
    this.meteor_play_figures[5].bottom = 0;

    this.meteor_play_figures[6].image_sources = [{ step_px: 5, width: 150, length: 250, event: 'move', source: 'vulkan.svg', live_iter: 75, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[6].coord_x = 500;
    //this.meteor_play_figures[6].coord_y = 380;
    this.meteor_play_figures[6].bottom = 0;
    this.meteor_play_figures[6].play_type = 'flying_obj';
    this.meteor_play_figures[6].figure_outline = 'star';
    this.meteor_play_figures[6].dom_id = 'vulkan';

    this.meteor_play_figures[7].image_sources = [{ step_px: 22, width: 124, length: 88, event: 'move', source: 'zhizn.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }
    , { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }
    ];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[7].coord_x = 0;
    this.meteor_play_figures[7].coord_y = 150;
    this.meteor_play_figures[7].play_type = 'live';
    this.meteor_play_figures[7].figure_outline = 'star';
    this.meteor_play_figures[7].score = 50;
    this.meteor_play_figures[7].wait_iterations = 200;
    this.meteor_play_figures[7].movement_type = 'cosinus';
    this.meteor_play_figures[7].dom_id = 'zhizn';

    this.meteor_play_figures[8].image_sources = [{ step_px: 5, width: 355, length: 55, event: 'move', source: 'landing.svg', live_iter: 75, iteration_count: 0 , active_heigth:null  },{ step_px: 5, width: 355, length: 55, event: 'move', source: 'landing2.svg', live_iter: 75, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[8].coord_x = 0;
    this.meteor_play_figures[8].visibility = 'hidden';
    //this.meteor_play_figures[8].coord_y = document.body.offsetHeight-55 ;//570;
    this.meteor_play_figures[8].set_position_bottom();
    this.meteor_play_figures[8].play_type = 'landing';
    this.meteor_play_figures[8].figure_outline = 'star';
    this.meteor_play_figures[8].score = 50;
    this.meteor_play_figures[8].wait_iterations = 1500;
    this.meteor_play_figures[8].dom_id = 'landing';

    this.meteor_play_figures[9].image_sources = [{ step_px: 5, width: 40, length: 40, event: 'move', source: 'planeta.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[9].coord_x = 700;
    this.meteor_play_figures[9].coord_y = 30;
    this.meteor_play_figures[9].play_type = 'flying_obj';
    this.meteor_play_figures[9].figure_outline = 'star';
    this.meteor_play_figures[9].dom_id = 'planeta';

    this.meteor_play_figures[10].image_sources = [{ step_px: 25, width: 60, length: 35, event: 'move', source: 'inoplanetjanin.svg', live_iter: 25, iteration_count: 0 , active_heigth:null  }, { step_px: 25, width: 60, length: 35, event: 'move', source: 'inoplanetjanin1.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }, { step_px: 25, width: 60, length: 35, event: 'move', source: 'inoplanetjanin2.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }, { step_px: 25, width: 60, length: 35, event: 'move', source: 'inoplanetjanin3.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }, { step_px: 25, width: 60, length: 35, event: 'move', source: 'inoplanetjanin4.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }, { step_px: 25, width: 60, length: 35, event: 'move', source: 'inoplanetjanin5.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }, { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 5, iteration_count: 0 , active_heigth:null  }
    , { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }
    ];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[10].coord_x = 800;
    this.meteor_play_figures[10].coord_y = 50;
    this.meteor_play_figures[10].play_type = 'end';
    this.meteor_play_figures[10].figure_outline = 'star';
    this.meteor_play_figures[10].movement_type = 'sinus';
    this.meteor_play_figures[10].dom_id = 'alien2';

    this.meteor_play_figures[11].image_sources = [{ step_px: 5, width: 40, length: 40, event: 'move', source: 'star_yellow.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[11].coord_x = 170;
    this.meteor_play_figures[11].coord_y = 160;
    this.meteor_play_figures[11].play_type = 'flying_obj';
    this.meteor_play_figures[11].figure_outline = 'star';
    this.meteor_play_figures[11].dom_id = 'star3';

    this.meteor_play_figures[12].image_sources = [{ step_px: 5, width: 40, length: 40, event: 'move', source: 'star_yellow.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[12].coord_x = 650;
    this.meteor_play_figures[12].coord_y = 70;
    this.meteor_play_figures[12].play_type = 'flying_obj';
    this.meteor_play_figures[12].figure_outline = 'star';
    this.meteor_play_figures[11].dom_id = 'star4';

    this.meteor_play_figures[13].image_sources = [{ step_px: 5, width: 40, length: 40, event: 'move', source: 'star_yellow.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[13].coord_x = 210;
    this.meteor_play_figures[13].coord_y = 130;
    this.meteor_play_figures[13].play_type = 'flying_obj';
    this.meteor_play_figures[13].figure_outline = 'star';
    this.meteor_play_figures[13].dom_id = 'star5';

    this.meteor_play_figures[14].image_sources = [{ step_px: 5, width: 40, length: 40, event: 'move', source: 'star_yellow.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[14].coord_x = 350;
    this.meteor_play_figures[14].coord_y = 270;
    this.meteor_play_figures[14].play_type = 'flying_obj';
    this.meteor_play_figures[14].figure_outline = 'star';
    this.meteor_play_figures[14].dom_id = 'star6';

    this.meteor_play_figures[15].image_sources = [{ step_px: 20, width: 35, length: 70, event: 'move', source: 'treug0.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }, { step_px: 20, width: 35, length: 150, event: 'move', source: 'treug.svg', live_iter: 5, iteration_count: 0 , active_heigth:null  }
    , { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }
    ];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[15].coord_x = 1150;
    this.meteor_play_figures[15].coord_y = 10;
    this.meteor_play_figures[15].play_type = 'flying_obj';
    this.meteor_play_figures[15].figure_outline = 'star';
    this.meteor_play_figures[15].play_type = 'end';
    this.meteor_play_figures[15].dom_id = 'treug0';

    this.meteor_play_figures[16].image_sources = [{ step_px: 20, width: 35, length: 70, event: 'move', source: 'treug0.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }, { step_px: 20, width: 35, length: 150, event: 'move', source: 'treug.svg', live_iter: 5, iteration_count: 0 , active_heigth:null  }, { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }
    ];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[16].coord_x = 1050;
    this.meteor_play_figures[16].coord_y = 400;
    this.meteor_play_figures[16].play_type = 'flying_obj';
    this.meteor_play_figures[16].figure_outline = 'star';
    this.meteor_play_figures[16].play_type = 'end';
    this.meteor_play_figures[16].dom_id = 'treug1';

    this.meteor_play_figures[17].image_sources = [{ step_px: 18, width: 70, length: 70, event: 'move', source: 'bomba.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[17].coord_x = 1020;
    this.meteor_play_figures[17].coord_y = 400;
    this.meteor_play_figures[17].play_type = 'flying_obj';
    this.meteor_play_figures[17].figure_outline = 'star';
    this.meteor_play_figures[17].play_type = 'bomb';
    this.meteor_play_figures[17].score = 300;
    this.meteor_play_figures[17].movement_type = 'sinus';
    this.meteor_play_figures[17].dom_id = 'bomba';

    this.meteor_play_figures[18].image_sources = [{ step_px: 20, width: 70, length: 70, event: 'move', source: 'laser_large.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[18].set_position_right();
    //this.meteor_play_figures[18].coord_y ;
    this.meteor_play_figures[18].play_type = 'flying_obj';
    this.meteor_play_figures[18].figure_outline = 'star';
    this.meteor_play_figures[18].play_type = 'laser_large';
    this.meteor_play_figures[18].score = 300;
    this.meteor_play_figures[18].movement_type = 'cosinus';
    this.meteor_play_figures[18].dom_id = 'laser_large';

    this.meteor_play_figures[19].image_sources = [{ step_px: 20, width: 87, length: 33, event: 'move', source: 'dvagalaza.svg', live_iter: 25, iteration_count: 0 , active_heigth:null  }, { step_px: 20, width: 87, length: 73, event: 'move', source: 'dvagalaza2.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }, { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 3, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[19].coord_x = 870;
    this.meteor_play_figures[19].coord_y = 450;
    this.meteor_play_figures[19].play_type = 'end';
    this.meteor_play_figures[19].figure_outline = 'star';
    this.meteor_play_figures[19].movement_type = 'sinus';
    this.meteor_play_figures[19].wait_iterations = 150;
    this.meteor_play_figures[19].dom_id = 'dvaglaza';

    this.meteor_play_figures[20].image_sources = [{ step_px: 25, width: 60, length: 35, event: 'move', source: 'inik.svg', live_iter: 25, iteration_count: 0 , active_heigth:null  }, { step_px: 25, width: 60, length: 35, event: 'move', source: 'inik2.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  }, { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[20].coord_x = 1000;
    this.meteor_play_figures[20].coord_y = 250;
    this.meteor_play_figures[20].play_type = 'end';
    this.meteor_play_figures[20].figure_outline = 'star';
    this.meteor_play_figures[20].movement_type = 'parabola';
    this.meteor_play_figures[20].dom_id = 'alien3';

    this.meteor_play_figures[21].image_sources = [{ step_px: 5, width: 80, length: 140, event: 'move', source: 'prizrak.svg', live_iter: 95, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[21].set_position_bottom();
    //this.meteor_play_figures[6].coord_y = 380;
    this.meteor_play_figures[21].visibility='hidden';
    this.meteor_play_figures[21].set_position_right;
    this.meteor_play_figures[21].play_type = 'flying_obj';
    this.meteor_play_figures[21].figure_outline = 'star';
    this.meteor_play_figures[21].dom_id = 'prizrak';
      
    this.meteor_play_figures[22].image_sources = [
    { step_px: 15, width: 2, length: 2, event: 'move', source: 'zorg4.svg', live_iter: 200, iteration_count: 0 , active_heigth:null  },
    { step_px: 8, width: 20, length: 30, event: 'move', source: 'zorg3.svg', live_iter: 30, iteration_count: 0 , active_heigth:null  },
    { step_px: 5, width: 50, length: 60, event: 'move', source: 'zorg2.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  },
    { step_px: 5, width: 50, length: 120, event: 'move', source: 'zorg1.svg', live_iter: 5, iteration_count: 0 , active_heigth:null  },
    { step_px: 5, width: 50, length: 700, event: 'move', source: 'zorg.svg', live_iter: 5, iteration_count: 0 , active_heigth:120}];
//, { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }
    
    this.meteor_play_figures[22].set_position_bottom();
    this.meteor_play_figures[22].coord_x = 280;
    //this.meteor_play_figures[22].visibility='hidden';
    this.meteor_play_figures[22].set_position_right;
    this.meteor_play_figures[22].play_type = 'end';
    this.meteor_play_figures[22].figure_outline = 'dyn';
    this.meteor_play_figures[22].dom_id = 'dynshoter';
    this.meteor_play_figures[22].init_killed=1;
    this.duplicate_img(22,50,3,4);
    this.meteor_play_figures[22].image_sources.push(new image_obj());
    this.meteor_play_figures[22].image_sources[this.meteor_play_figures[22].image_sources.length-1]={ step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  };


    this.meteor_play_figures[23].image_sources = [
      { step_px: 18, width: 3, length: 3, event: 'move', source: 'zorg4.svg', live_iter: 150, iteration_count: 0 , active_heigth:null  },
      { step_px: 12, width: 20, length: 30, event: 'move', source: 'zorg3.svg', live_iter: 80, iteration_count: 0 , active_heigth:null  },
      { step_px: 5, width: 50, length: 60, event: 'move', source: 'zorg2.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  },
      { step_px: 7, width: 50, length: 120, event: 'move', source: 'zorg1.svg', live_iter: 5, iteration_count: 0 , active_heigth:null  },
      { step_px: 7, width: 50, length: 700, event: 'move', source: 'zorg.svg', live_iter: 5, iteration_count: 0 ,  active_heigth:120}];
    //, { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }
    this.meteor_play_figures[23].set_position_bottom();
    this.meteor_play_figures[23].coord_x = 480;
    //this.meteor_play_figures[22].visibility='hidden';
    this.meteor_play_figures[23].set_position_right;
    this.meteor_play_figures[23].play_type = 'end';
    this.meteor_play_figures[23].figure_outline = 'dyn';
    this.meteor_play_figures[23].dom_id = 'dynshoter1';
    this.meteor_play_figures[23].init_killed=1;
    this.duplicate_img(23,50,3,4);
    this.meteor_play_figures[23].image_sources.push(new image_obj());
    this.meteor_play_figures[23].image_sources[this.meteor_play_figures[23].image_sources.length-1]={ step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  };

    this.meteor_play_figures[24].image_sources = [
      { step_px: 25, width: 5, length: 5, event: 'move', source: 'zorg4.svg', live_iter: 120, iteration_count: 0 , active_heigth:null  },
      { step_px: 15, width: 18, length: 30, event: 'move', source: 'zorg3.svg', live_iter: 120, iteration_count: 0 , active_heigth:null  },
      { step_px: 5, width: 50, length: 60, event: 'move', source: 'zorg2.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  },
      { step_px: 20, width: 50, length: 120, event: 'move', source: 'zorg1.svg', live_iter: 5, iteration_count: 0 , active_heigth:null  },
      { step_px: 20, width: 50, length: 700, event: 'move', source: 'zorg.svg', live_iter: 5, iteration_count: 0 ,  active_heigth:120}];
    //, { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }
    this.meteor_play_figures[24].set_position_bottom();
    this.meteor_play_figures[24].coord_x = 680;
    //this.meteor_play_figures[22].visibility='hidden';
    this.meteor_play_figures[24].set_position_right;
    this.meteor_play_figures[24].play_type = 'end';
    this.meteor_play_figures[24].figure_outline = 'dyn';
    this.meteor_play_figures[24].dom_id = 'dynshoter2';
    this.meteor_play_figures[24].init_killed=1;
    this.duplicate_img(24,50,3,4);
    this.meteor_play_figures[24].image_sources.push(new image_obj());
    this.meteor_play_figures[24].image_sources[this.meteor_play_figures[24].image_sources.length-1]={ step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  };

    this.meteor_play_figures[25].image_sources = [
      { step_px: 20, width: 3, length: 3, event: 'move', source: 'zorg4.svg', live_iter: 70, iteration_count: 0 , active_heigth:null  },
      { step_px: 5, width: 20, length: 30, event: 'move', source: 'zorg3.svg', live_iter: 40, iteration_count: 0 , active_heigth:null  },
      { step_px: 5, width: 50, length: 60, event: 'move', source: 'zorg2.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  },
      { step_px: 15, width: 50, length: 120, event: 'move', source: 'zorg1.svg', live_iter: 5, iteration_count: 0 , active_heigth:null  },
      { step_px: 15, width: 50, length: 700, event: 'move', source: 'zorg.svg', live_iter: 5, iteration_count: 0  , active_heigth:120}];
    //, { step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  }
    this.meteor_play_figures[25].set_position_bottom();
    this.meteor_play_figures[25].coord_x = 880;
    //this.meteor_play_figures[22].visibility='hidden';
    this.meteor_play_figures[25].set_position_right;
    this.meteor_play_figures[25].play_type = 'end';
    this.meteor_play_figures[25].figure_outline = 'dyn';
    this.meteor_play_figures[25].dom_id = 'dynshoter3';
    this.meteor_play_figures[25].init_killed=1;
    this.duplicate_img(25,50,3,4);
    this.meteor_play_figures[25].image_sources.push(new image_obj());
    this.meteor_play_figures[25].image_sources[this.meteor_play_figures[25].image_sources.length-1]={ step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  };


    this.meteor_play_figures[26].image_sources = [{ step_px: 5, width: 40, length: 40, event: 'move', source: 'nazvanie.svg', live_iter: 0, iteration_count: 1, active_heigth:null }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[26].coord_x = 300;
    this.meteor_play_figures[26].coord_y = 300;
    this.meteor_play_figures[26].play_type = 'flying_obj';
    this.meteor_play_figures[26].figure_outline = 'star';
    this.meteor_play_figures[26].dom_id = 'star2';
    this.meteor_play_figures[26].wait_iterations = 3000;
/* robot */
    this.meteor_play_figures[27].image_sources = [{ step_px: 1, width: 200, length: 400, event: 'move', source: 'gigant_rooboti.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  }
    ,{ step_px: 1, width: 200, length: 400, event: 'move', source: 'gigant_rooboti2.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  }
    ];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[27].set_position_bottom();
    //this.meteor_play_figures[6].coord_y = 380;
    this.meteor_play_figures[27].visibility='hidden';
    this.meteor_play_figures[27].set_position_right;
    this.meteor_play_figures[27].play_type = 'flying_obj';
    this.meteor_play_figures[27].figure_outline = 'star';
    this.meteor_play_figures[27].dom_id = 'gigant_robot';
    this.meteor_play_figures[27].wait_iterations = 200;
    this.meteor_play_figures[27].z_index='20';
    this.meteor_play_figures[27].max_appearences=1;
    this.meteor_play_figures[27].on_change_next_image=()=>{if (this.meteor_play_figures[27].coord_x<=1100 && !this.robot_init_marker )  {this.robot_init(); this.robot_init_marker=true;} if (this.meteor_play_figures[27].current_source_index==0) this.robot_laser_pli(); };
   // this.meteor_play_figures[27].image_sources[this.meteor_play_figures[27].image_sources.length-1]={ step_px: 0, width: 60, length: 35, event: 'disappear', source: 'vrag_vzriv.svg', live_iter: 2, iteration_count: 0 , active_heigth:null  };

    
    this.meteor_play_figures[28].image_sources = [{ step_px: 75, width: 21, length: 1, event: 'move', source: 'trace1.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  },{ step_px: 75, width: 21, length: 1, event: 'move', source: 'trace1.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[28].coord_x = 0;
    this.meteor_play_figures[28].coord_y = 0;
    this.meteor_play_figures[28].status = 'notactual';
    this.meteor_play_figures[28].play_type = 'end';
    this.meteor_play_figures[28].figure_outline = 'star';
    this.meteor_play_figures[28].dom_id = 'trace1';
    this.meteor_play_figures[28].visibility='hidden';
    this.meteor_play_figures[28].z_index='30';
    this.meteor_play_figures[28].on_repeat_object=()=>{ this.robot_laser_lifo.push(28)};

    this.meteor_play_figures[29].image_sources = [{ step_px: 75, width: 21, length: 1, event: 'move', source: 'trace1.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  },{ step_px: 75, width: 21, length: 1, event: 'move', source: 'trace1.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  } ];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[29].coord_x = 0;
    this.meteor_play_figures[29].coord_y = 0;
    this.meteor_play_figures[29].status = 'notactual';
    this.meteor_play_figures[29].play_type = 'end';
    this.meteor_play_figures[29].figure_outline = 'star';
    this.meteor_play_figures[29].dom_id = 'trace1';
    this.meteor_play_figures[29].visibility='hidden';
    this.meteor_play_figures[29].z_index='30';
    this.meteor_play_figures[29].on_repeat_object=()=>{this.robot_laser_lifo.push(29);};

    this.meteor_play_figures[30].image_sources = [{ step_px: 75, width: 21, length: 1, event: 'move', source: 'trace1.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  },{ step_px: 75, width: 21, length: 1, event: 'move', source: 'trace1.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[30].coord_x = 0;
    this.meteor_play_figures[30].coord_y = 0;
    this.meteor_play_figures[30].status = 'notactual';
    this.meteor_play_figures[30].play_type = 'end';
    this.meteor_play_figures[30].figure_outline = 'star';
    this.meteor_play_figures[30].dom_id = 'trace1';
    this.meteor_play_figures[30].visibility='hidden';
    this.meteor_play_figures[30].z_index='30';
    this.meteor_play_figures[30].on_repeat_object=()=>{this.robot_laser_lifo.push(30);};

    this.meteor_play_figures[31].image_sources = [{ step_px: 75, width: 21, length: 1, event: 'move', source: 'trace1.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  },{ step_px: 75, width: 21, length: 1, event: 'move', source: 'trace1.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 }
    this.meteor_play_figures[31].coord_x = 0;
    this.meteor_play_figures[31].coord_y = 0;
    this.meteor_play_figures[31].status = 'notactual';
    this.meteor_play_figures[31].play_type = 'end';
    this.meteor_play_figures[31].figure_outline = 'star';
    this.meteor_play_figures[31].dom_id = 'trace1';
    this.meteor_play_figures[31].visibility='hidden';
    this.meteor_play_figures[31].z_index='30';
    this.meteor_play_figures[31].on_repeat_object=()=>{this.robot_laser_lifo.push(31);};

    this.meteor_play_figures[32].image_sources = [{ step_px: 75, width: 21, length: 1, event: 'move', source: 'trace1.svg', live_iter: 15, iteration_count: 0 , active_heigth:null  },{ step_px: 75, width: 21, length: 1, event: 'move', source: 'trace1.svg', live_iter: 10, iteration_count: 0 , active_heigth:null  }];
    //,{width: 40, length: 40, event:'move' , source: 'star_white.svg', live_iter:5, iteration_count:0 } status = 'notactual'
    this.meteor_play_figures[32].coord_x = 0;
    this.meteor_play_figures[32].coord_y = 0;
    this.meteor_play_figures[32].status = 'notactual';
    this.meteor_play_figures[32].play_type = 'end';
    this.meteor_play_figures[32].figure_outline = 'star';
    this.meteor_play_figures[32].dom_id = 'trace1';
    this.meteor_play_figures[32].visibility='hidden';
    this.meteor_play_figures[32].z_index='30';
    this.meteor_play_figures[32].on_repeat_object=()=>{this.robot_laser_lifo.push(32);};

    this.meteor_play_figures[33].image_sources =[{ step_px: 1, width: 50, length: 50, event: 'move', source: '', live_iter: 10, iteration_count: 0 , active_heigth:null  }];
    this.meteor_play_figures[33].set_position_bottom();
    //this.meteor_play_figures[6].coord_y = 380;
    this.meteor_play_figures[33].visibility='hidden';
    this.meteor_play_figures[33].set_position_right;
    this.meteor_play_figures[33].play_type = 'flying_obj';
    this.meteor_play_figures[33].figure_outline = 'star';
    this.meteor_play_figures[33].dom_id = 'gigant_robot';
    this.meteor_play_figures[33].wait_iterations = 200;
    this.meteor_play_figures[33].z_index='25';
    this.meteor_play_figures[33].element_type='TXT';
    this.meteor_play_figures[33].text_val='100';
    this.meteor_play_figures[33].max_appearences=1;

    this.meteor_play_figures[33].coord_x = this.meteor_play_figures[27].coord_x;
    this.meteor_play_figures[33].coord_y = this.meteor_play_figures[27].coord_y+220;
    this.meteor_play_figures[33].on_move_object=(figure: play_figure)=>{
    let counter: number = 4;
    let figures_arr:number[]=new Array(28,29,30,31,32);
    figure.coord_x = this.meteor_play_figures[27].coord_x + this.meteor_play_figures[27].image_sources[0].width/2-15;
    if (figure.text_val>0){
      if (Math.floor( figure.iteration_count/counter) ==   figure.iteration_count/counter){
        figure.text_val=figure.text_val -1;
      }
    }
    else {
      this.meteor_play_figures[27].play_type = 'end';
      for (let i:number=0;i<figures_arr.length;i++){    
         //this.robot_laser_lifo.push(figures_arr[i]);
          this.meteor_play_figures[figures_arr[i]].inactivate();    
        }
      this.meteor_play_figures[33].inactivate();        
    }

    };
    

    //console.log('acc:'+this.meteor_play_figures.length);
    this.meteor_play_figures.push( this.player_figures[1].man_play_figure);
    if(this.local_one_player) {
      this.player_figures[1].man_play_figure.visibility='hidden';
      this.server_game=false;
      this.generate_figure_ind();
      this.input_form_visibility='hidden';
      setInterval(() => { this.my_main(); }, 50);
      //this.newGame();      
    }
//console.log('w:'+this.standard.right+';h:'+this.standard.bottom);
  }

robot_laser_pli(){
  var ind:number;
  let p_ind:number=0;
  let koef:number=1;
  if (this.robot_laser_lifo.length>0 && this.meteor_play_figures[27].play_type!='end' && this.meteor_play_figures[27].status=='move' ){  
    ind=this.robot_laser_lifo.pop();
    this.meteor_play_figures[ind].coord_x = this.meteor_play_figures[27].coord_x+80;
    this.meteor_play_figures[ind].coord_y = this.meteor_play_figures[27].coord_y+133;
    
    if (this.server_game && Math.floor(ind / 2)==ind/2) p_ind=0 ;
    if (this.server_game && Math.floor(ind / 2)!=ind/2) p_ind=1 ;

    let w:number=Math.abs(this.player_figures[p_ind].man_play_figure.coord_x- this.meteor_play_figures[ind].coord_x) ;
    let h:number=this.meteor_play_figures[ind].coord_y - this.player_figures[p_ind].man_play_figure.coord_y ;
    if (h!=0) koef=h/w;
    this.meteor_play_figures[ind].move_obj_current={'koef':koef,'x0':this.meteor_play_figures[ind].coord_x,'y0':this.meteor_play_figures[ind].coord_y};
    
    this.meteor_play_figures[ind].on_move_object=(figure: play_figure)=>{
                        
      figure.coord_x=figure.coord_x-figure.image_sources[figure.current_source_index].step_px;
      figure.coord_y= figure.move_obj_current.y0 - (figure.move_obj_current.koef)*(figure.move_obj_current.x0 - figure.coord_x);
      //console.log(figure.ind+'; koef:' + this.meteor_play_figures[ind].move_obj_current.koef + ';x0:' + this.meteor_play_figures[ind].move_obj_current.x0 + ';x:' + figure.coord_x + ';y:' + figure.coord_y );      
    
  };
    this.meteor_play_figures[ind].object_continue_move();
  }
}

robot_init(){
  let figures_arr:number[]=new Array(28,29,30,31,32);
  let lwidth=23;
  this.meteor_play_figures[27].stop_moving();
  //this.meteor_play_figures[33].coord_x = this.meteor_play_figures[27].coord_x;
  
  this.meteor_play_figures[33].stop_moving();
  
  for (let i:number=0;i<figures_arr.length;i++){    
    this.robot_laser_lifo.push(figures_arr[i]);
    //this.meteor_play_figures[figures_arr[i]].status = 'move';    
  }

}

newGame(){
    //console.log(this.server_marker);
    
   

    if (this.server_marker!=''){
    this.server_player_ind=this.input_form_num_plyer;
    this.server_game=true;
    if (this.server_player_ind==0) {
      this.server_leader=true;
      
    }
    else this.server_leader=false;
    
    
    //new player_keyset(68,65,88,69,90);// new player_keyset(39, 37, 40, 38, 32);
    this.player_figures[this.server_player_ind].man_play_figure.keyset =    new player_keyset(39, 37, 40, 38, 32);
    for (let i=0;i<this.player_figures.length;i++){
      if (i!=this.server_player_ind) this.player_figures[i].man_play_figure.keyset =  new player_keyset(68,65,88,69,90);
    }

    }
    else this.server_game=false; 
    this.input_form_visibility='hidden';
    this.generate_figure_ind();
    if (this.server_game){
      this.server_operation='init';      
      this.prepare_sevrer_message(true);      
      this.send_server_all();      
      this.server_operation='run';
    }
    setInterval(() => { this.my_main(); }, 50);

}

duplicate_img(ind:number,count:number,dupnum1:number,dupnum2:number){
    for (let a=0;a<count;a++){
      let img_new:image_obj=new image_obj();
      this.meteor_play_figures[ind].image_sources.push(img_new);
      this.meteor_play_figures[ind].clone_image_obj(this.meteor_play_figures[ind].image_sources[dupnum1],img_new);
      let img_new2:image_obj=new image_obj();
      this.meteor_play_figures[ind].image_sources.push(img_new2);
      this.meteor_play_figures[ind].clone_image_obj(this.meteor_play_figures[ind].image_sources[dupnum2],img_new2);      
    }


}

  ispoint_cross_figure(coord_x: number, coord_y: number, pWidth: number, pLength: number, pAx: number, pAy: number): boolean {
    if (coord_x <= pAx && (coord_x + pWidth) >= pAx && coord_y <= pAy && (coord_y + pLength) >= pAy) return true;
    //if (type=='shot' && coord_x <= pAx && (coord_x + pWidth) >= pAx && coord_y >= pAy && (coord_y + pLength) >= pAy) return true;
    return false;
  }
  ispoint_cross_figure_shot(coord_x: number, coord_y: number, pWidth: number, pALength: number, pAx: number, pAy: number): boolean {
    //if (coord_x <= pAx && (coord_x + pWidth) >= pAx && coord_y <= pAy && (coord_y + pLength) >= pAy) return true;
    // this.values+='s:' + coord_x + '-' + pAx + '-' + (coord_x + pWidth) + '|'; 
    if (coord_x <= pAx && (coord_x + pWidth) >= pAx && coord_y >= pAy && (pAy + pALength) >= coord_y) return true;
    // 
    return false;
  }

  process_output_figure(figure: play_figure, type: string,player_figure:play_man) {
    //let player_figure: play_man;
   // for (let i = 0; i < this.player_figures.length; i++) {
      //player_figure = this.player_figures[i];
      if (figure.play_type == 'laser_large' && figure.visibility == 'visible' && type == 'player') {
        player_figure.weapon_img = 'laser_large_shot.svg';
        player_figure.weapon_width = 450;
        player_figure.weapon_length = 9;
        player_figure.weapon_gan_bullets=player_figure.weapon_gan_bullets+50;
        //figure.hide_object();
        this.hide_object(figure);        
      }

      if (figure.play_type == 'end' && figure.visibility == 'visible' && type == 'shot' && player_figure.weapon_visibility == 'visible') {
        //figure.hide_object();
        this.hide_object(figure);
        this.bam_sound.play();
        if (!this.server_game || (this.server_game && this.server_leader))
        player_figure.add_scores(figure.score);
        
      }

      if (figure.play_type == 'bomb' && figure.visibility == 'visible' && type == 'player') {
        if (!this.server_game || (this.server_game && this.server_leader))
        player_figure.add_scores(figure.score);
        this.clear_dangerous_obj();
        //figure.hide_object();
        this.hide_object(figure);
      }

      if (figure.play_type == 'live' && figure.visibility == 'visible' && type == 'player') {
        //figure.hide_object();
        this.hide_object(figure);
        if (!this.server_game || (this.server_game && this.server_leader)){
        player_figure.add_scores(figure.score);
        player_figure.add_live_count(1);
        }
      }
      if (figure.play_type == 'landing' && figure.visibility == 'visible' && type == 'player') {
        this.main_service.game_state = 'win';
      }

      //this.main_service.game_state
      if (figure.play_type == 'prize' && figure.visibility == 'visible' && type == 'player') this.hide_object(figure); //figure.visibility = 'hidden';
      if ((figure.play_type == 'end' || figure.play_type == 'dyn') && figure.status == 'move' && type == 'player' ) {
        if (!this.server_game || (this.server_game && this.server_leader))
        player_figure.add_live_count(-1);
        this.bim_sound.play();
        if (player_figure.live_count <= 0) {
          this.main_service.game_state = 'finish';
          this.main_service.play_bg.pause();
          new Audio(this.main_service.play_end).play();
        }
        this.hide_object(figure);
      }
   // }//end for 
  }

  canmove(pLeft: number, pTop: number, pWidth: number, pLength: number): boolean {
    let element: play_figure;
    for (var x = 1; x < this.meteor_play_figures.length; x++) {
      element = this.meteor_play_figures[x];
      //if (pLeft>900) this.values=element.play_type; 
      if (element.play_type == 'barrier' && this.ispoint_cross_figure(element.coord_x, element.coord_y, element.image_sources[element.current_source_index].width, element.image_sources[element.current_source_index].length, pLeft, pTop)) return false;
      if (element.play_type == 'barrier' && this.ispoint_cross_figure(element.coord_x, element.coord_y, element.image_sources[element.current_source_index].width, element.image_sources[element.current_source_index].length, pLeft + pWidth, pTop)) return false;
      if (element.play_type == 'barrier' && this.ispoint_cross_figure(element.coord_x, element.coord_y, element.image_sources[element.current_source_index].width, element.image_sources[element.current_source_index].length, pLeft, pTop + pLength)) return false;
      if (element.play_type == 'barrier' && this.ispoint_cross_figure(element.coord_x, element.coord_y, element.image_sources[element.current_source_index].width, element.image_sources[element.current_source_index].length, pLeft + pWidth, pTop + pLength)) return false;

      if (element.play_type == 'barrier' && this.ispoint_cross_figure(pLeft, pTop, pWidth, pLength, element.coord_x, element.coord_y)) return false;
      if (element.play_type == 'barrier' && this.ispoint_cross_figure(pLeft, pTop, pWidth, pLength, element.coord_x + element.image_sources[element.current_source_index].width, element.coord_y)) return false;
      if (element.play_type == 'barrier' && this.ispoint_cross_figure(pLeft, pTop, pWidth, pLength, element.coord_x, element.coord_y + element.image_sources[element.current_source_index].length)) return false;
      if (element.play_type == 'barrier' && this.ispoint_cross_figure(pLeft, pTop, pWidth, pLength, element.coord_x + element.image_sources[element.current_source_index].width, element.coord_y + element.image_sources[element.current_source_index].length)) return false;

    }
    return true;
  }
//pLeft: number, pTop: number, pWidth: number, pLength: number, type: string,

ispoint_cross_figure_v2(a1:number,a2:number,b1:number,b2:number){
  if ( ((a1<=b1) && (a2>=b1))  || ((a1<=b2) && (a2>=b2)) ) return true;
  return false;  
}

check_figures_v2(f1_x1:number,f1_width:number,f2_x1:number,f2_width:number, f1_y1:number,f1_height:number,f2_y1:number,f2_height:number):boolean {
    let x_match:boolean=false;
    let y_match:boolean=false;
    let f1_x2:number=f1_x1 + f1_width;
    let f2_x2:number=f2_x1 + f2_width;
    let f1_y2:number=f1_y1 + f1_height;
    let f2_y2:number=f2_y1 + f2_height;

    if (f1_width>f2_width) x_match=this.ispoint_cross_figure_v2(f1_x1,f1_x2,f2_x1,f2_x2);    
    else x_match=this.ispoint_cross_figure_v2(f2_x1,f2_x2,f1_x1,f1_x2); 

    if (f1_height>f2_height) y_match=this.ispoint_cross_figure_v2(f1_y1,f1_y2,f2_y1,f2_y2);    
    else y_match=this.ispoint_cross_figure_v2(f2_y1,f2_y2,f1_y1,f1_y2); 
    
    return x_match && y_match;
}

  check_figures(pLeft: number, pTop: number, pWidth: number, pLength: number, type: string,player_figure:play_man) {

    let ret_value: string = '';
    if (player_figure.man_play_figure.visibility=='hidden') return;

    this.meteor_play_figures.forEach(element => {
      ret_value = '0';
      if (element.play_type != 'player' && type != 'shot') {
        if (this.check_figures_v2(pLeft,pWidth, element.coord_x,element.image_sources[element.current_source_index].width,pTop,pLength,element.coord_y, element.image_sources[element.current_source_index].length) ) this.process_output_figure(element, type,player_figure);
    /*
         
        if (this.ispoint_cross_figure(element.coord_x, element.coord_y, element.image_sources[element.current_source_index].width, element.image_sources[element.current_source_index].length, pLeft, pTop)) this.process_output_figure(element, type,player_figure);
        if (this.ispoint_cross_figure(element.coord_x, element.coord_y, element.image_sources[element.current_source_index].width, element.image_sources[element.current_source_index].length, pLeft + pWidth, pTop)) this.process_output_figure(element, type,player_figure);
        if (this.ispoint_cross_figure(element.coord_x, element.coord_y, element.image_sources[element.current_source_index].width, element.image_sources[element.current_source_index].length, pLeft, pTop + pLength)) this.process_output_figure(element, type,player_figure);
        if (this.ispoint_cross_figure(element.coord_x, element.coord_y, element.image_sources[element.current_source_index].width, element.image_sources[element.current_source_index].length, pLeft + pWidth, pTop + pLength)) this.process_output_figure(element, type,player_figure);

        if (this.ispoint_cross_figure(pLeft, pTop, pWidth, pLength, element.coord_x, element.coord_y)) this.process_output_figure(element, type,player_figure);
        if (this.ispoint_cross_figure(pLeft, pTop, pWidth, pLength, element.coord_x + element.image_sources[element.current_source_index].width, element.coord_y)) this.process_output_figure(element, type,player_figure);
        if (this.ispoint_cross_figure(pLeft, pTop, pWidth, pLength, element.coord_x, element.coord_y + element.image_sources[element.current_source_index].length)) this.process_output_figure(element, type,player_figure);
        if (this.ispoint_cross_figure(pLeft, pTop, pWidth, pLength, element.coord_x + element.image_sources[element.current_source_index].width, element.coord_y + element.image_sources[element.current_source_index].length)) this.process_output_figure(element, type,player_figure);
      */

      }
      if (element.play_type != 'player' && type == 'shot' && element.play_type == 'end') {
    
        //if (element.figure_outline!=='dyn' && this.ispoint_cross_figure_shot(pLeft, pTop, pWidth, element.image_sources[element.current_source_index].length, element.coord_x, element.coord_y)) this.process_output_figure(element, type,player_figure);
        if (element.figure_outline!=='dyn' && this.check_figures_v2(pLeft,pWidth, element.coord_x,element.image_sources[element.current_source_index].width,pTop,pLength,element.coord_y, element.image_sources[element.current_source_index].length)) this.process_output_figure(element, type,player_figure);
        if (element.figure_outline=='dyn' ) {
          let ah=element.image_sources[element.current_source_index].active_heigth;
          if (ah!=null && ah>0){
          if (this.check_figures_v2(pLeft,pWidth, element.coord_x,element.image_sources[element.current_source_index].width,pTop,pLength,element.coord_y, ah)) this.process_output_figure(element, type,player_figure);
          } else if (this.check_figures_v2(pLeft,pWidth, element.coord_x,element.image_sources[element.current_source_index].width,pTop,pLength,element.coord_y, element.image_sources[element.current_source_index].length)) this.process_output_figure(element, type,player_figure);
          /*
          if (ah!=null && ah>0){
          if ( this.ispoint_cross_figure_shot(pLeft, pTop, pWidth, 120 , element.coord_x, (element.standard.bottom-ah)))this.process_output_figure(element, type,player_figure);
          } else if( this.ispoint_cross_figure_shot(pLeft, pTop, pWidth, 120 , element.coord_x, (element.standard.bottom-element.image_sources[element.current_source_index].length)))this.process_output_figure(element, type,player_figure);
          */

        }
        
      }
      
    });

  }

  // without strong typing
  onkeydown(event: any) {
    //this.values += event.key + '-' + event.keyCode ;
    if (this.main_service.game_state != 'run') return;
    this.main_service.fill_keymap(event);
    /*
        let vTop: number = this.player_figure.man_play_figure.coord_y;
        let vLeft: number = this.player_figure.man_play_figure.coord_x;
    */
  }

  gun_fire() {
    this.player_figures.forEach(player_figure => {
      this.check_figures(player_figure.weapon_coord_x, player_figure.weapon_coord_y, player_figure.weapon_width, player_figure.weapon_length, 'shot',player_figure);
    });

  }
  my_main(): void {
    this.move_active_objects(this.step_counter, 15, 3);
    this.step_counter++;
  }
  add_objects(type: string, cnt_obj: string) {

  }
  move_active_objects(counter: number, step: number, iter_count: number): void {
    let image_src: image_obj;
    
    
    if (this.main_service.game_state == 'run') {        
        if (this.server_game) this.init_server_delta();    
        for (let i = 0; i < this.player_figures.length; i++) {
          if ( this.player_figures[i].gamepad==true) this.main_service.fill_keymap_gamepad();
          
          this.player_figures[i].move_object(this.main_service.current_keymap); //this.meteor_play_figures[i].coord_x=this.meteor_play_figures[i].coord_x-image_src.step_px;
          this.player_figures[i].show_blow();
          this.player_figures[i].check_hide_blow(-1);
        }

       if (!this.server_game) this.gun_fire();
/* server game block  */
        if (!this.server_leader && this.server_game) {
          this.gun_fire();
          this.set_server();
        }
        if (Math.floor(counter / 3) && (this.server_game) && !this.server_leader) {
          this.get_server();
          this.proc_server_response_player_figures();
          this.proc_server_response_other_players(); 
        }
        if (Math.floor(counter / 1) &&this.server_game && this.server_leader) {
                   
          this.get_server();
         // this.proc_server_response_delta();
          this.proc_server_response_other_players(); 
               
        }

        
        if (this.server_leader && this.server_game) this.gun_fire();
/* end server game block */        
      for (let i = 0; i < this.meteor_play_figures.length; i++) {
        image_src = this.meteor_play_figures[i].image_sources[this.meteor_play_figures[i].current_source_index];

        if (Math.floor(counter / iter_count) == counter / iter_count){
          if ( this.meteor_play_figures[i].play_type != 'player' && this.meteor_play_figures[i].visibility == "visible") {
            if (!this.server_game || (this.server_game && this.server_leader))
            this.meteor_play_figures[i].move_object(this.main_service.current_keymap,0); //this.meteor_play_figures[i].coord_x=this.meteor_play_figures[i].coord_x-image_src.step_px;
          }
        }  
        this.meteor_play_figures[i].iteration_count++;
        if (image_src.iteration_count > image_src.live_iter && (!this.server_game || (this.server_game && this.server_leader) )) {
          this.meteor_play_figures[i].change_next_image();
          
        }
        this.meteor_play_figures[i].image_sources[this.meteor_play_figures[i].current_source_index].iteration_count++;

        for (let i = 0; i < this.player_figures.length; i++) 
         this.check_figures(this.player_figures[i].man_play_figure.coord_x, this.player_figures[i].man_play_figure.coord_y, 210, 70, 'player',this.player_figures[i]);
        

        if (this.meteor_play_figures[i].coord_x <= 0 && this.meteor_play_figures[i].play_type != 'player' && this.meteor_play_figures[i].visibility == "visible" && (!this.server_game || (this.server_game && this.server_leader) )) {
          this.meteor_play_figures[i].set_hidden_prop();
        }
        if (this.meteor_play_figures[i].play_type != 'player' && this.meteor_play_figures[i].visibility == "hidden" && this.meteor_play_figures[i].status != "notactual"  && (!this.server_game || (this.server_game && this.server_leader) )) this.meteor_play_figures[i].repeat_object();
 
      }//end for   
      if (this.server_leader && this.server_game) this.set_server();
    }
  }

  clear_dangerous_obj() {

    for (var i = 0; i < this.meteor_play_figures.length; i++) {
      if (this.meteor_play_figures[i].visibility == 'visible' && this.meteor_play_figures[i].play_type == 'end' && this.meteor_play_figures[i].figure_outline!='dyn' ) {
        this.meteor_play_figures[i].destroy_object();

      }
    }
  }
set_server(){
this.server_operation='set';
this.prepare_sevrer_message(false);
//this.send_server_all();
  let errorMessage:string;
  let ret:any; 
  this.server_interaction.informStatus(this.main_server_send_player).then(
                        server_send_player => ret = server_send_player,
                        error =>  errorMessage = error);
  
}
get_server(){
    let ret_arr:server_return[];
    let errorMessage:string;
    //this.server_interaction.getMove();
//this.server_interaction.search();
this.server_operation='get';
this.prepare_sevrer_message(false);
this.send_server_all();
/*
this.server_interaction.getHeroes()
                      .then(
                       server_return => this.ret_arr = server_return,
                       error =>  errorMessage = <any>error);
*/
//if (this.main_service.game_state=='run')
/*
  this.server_interaction.informStatus(this.main_server_send_player).then(
                        server_return => this.ret_arr = server_return,
                        error =>  errorMessage = <any>error);
*/                        
}

prepare_sevrer_message(init:Boolean){//function used to form server message.
  let ind:number;
 // for (let i=0;i<this.player_figures.length;i++){
   //console.log('ix:'+this.server_player_ind);
  let i:number=this.server_player_ind;
//    if (this.player_figures[i].server_send){
      if (init) {
        this.main_server_send_player.players=Array(new server_player());
        
        //this.main_server_send_player.players.push(new server_player());
      }
      ind=this.main_server_send_player.players.length-1;
      
      this.main_server_send_player.players[ind].coord_x=this.player_figures[i].man_play_figure.coord_x;
      this.main_server_send_player.players[ind].coord_y=this.player_figures[i].man_play_figure.coord_y;
      this.main_server_send_player.players[ind].current_source_index=this.player_figures[i].man_play_figure.current_source_index;
      this.main_server_send_player.players[ind].live_count=this.player_figures[i].live_count;
      this.main_server_send_player.players[ind].total_scores=this.player_figures[i].total_scores;
      this.main_server_send_player.players[ind].weapon_coord_x=this.player_figures[i].weapon_coord_x;
      this.main_server_send_player.players[ind].weapon_coord_y=this.player_figures[i].weapon_coord_y;
      this.main_server_send_player.players[ind].weapon_gan_bullets=this.player_figures[i].weapon_gan_bullets;
      this.main_server_send_player.players[ind].weapon_img=this.player_figures[i].weapon_img;
      this.main_server_send_player.players[ind].weapon_length=this.player_figures[i].weapon_length;
      this.main_server_send_player.players[ind].weapon_shift_left=this.player_figures[i].weapon_shift_left;
      this.main_server_send_player.players[ind].weapon_shift_top=this.player_figures[i].weapon_shift_top;
      this.main_server_send_player.players[ind].weapon_visibility=this.player_figures[i].weapon_visibility;
      this.main_server_send_player.players[ind].weapon_width=this.player_figures[i].weapon_width;
      this.main_server_send_player.players[ind].ind=i;
      this.main_server_send_player.players[ind].server_leader=this.server_leader;
      this.main_server_send_player.players[ind].server_marker=this.server_marker;    
      this.main_server_send_player.players[ind].server_operation=this.server_operation;  

      this.main_server_send_player.players[ind].blow_img=this.player_figures[i].blow_img;
      this.main_server_send_player.players[ind].blow_img_visibility=this.player_figures[i].blow_img_visibility;
      this.main_server_send_player.players[ind].blow_shift_left=this.player_figures[i].blow_shift_left;
      this.main_server_send_player.players[ind].blow_shift_top=this.player_figures[i].blow_shift_top;
      this.main_server_send_player.players[ind].blow_z_index=this.player_figures[i].blow_z_index;
      this.main_server_send_player.players[ind].blow_counter=this.player_figures[i].blow_counter;
      this.main_server_send_player.players[ind].blow_counter_setvalue=this.player_figures[i].blow_counter_setvalue;
      this.main_server_send_player.players[ind].blow_coord_x=this.player_figures[i].blow_coord_x;
      this.main_server_send_player.players[ind].blow_coord_y=this.player_figures[i].blow_coord_y;        
      this.main_server_send_player.players[ind].display_height=this.standard.bottom;
      this.main_server_send_player.players[ind].display_width=this.standard.right;

      if (this.server_leader==true) {  
        this.main_server_send_player.players[ind].nonleader_live_count=this.player_figures[1].live_count;
        this.main_server_send_player.players[ind].nonleader_total_scores=this.player_figures[1].total_scores; 
        //console.log(ind +'lc:'+this.main_server_send_player.players[ind].nonleader_live_count);      
        //this.main_server_send_player.players[ind].nonleader_blow_img_visibility=this.player_figures[1].blow_img_visibility;
        this.main_server_send_player.players[ind].nonleader_blow_counter=this.player_figures[1].blow_counter;
        
       // this.main_server_send_player.players[ind].nonleader_blow_coord_x=this.player_figures[1].blow_coord_x;
       // this.main_server_send_player.players[ind].nonleader_blow_coord_y=this.player_figures[1].blow_coord_y;              
      }


  //  }
  //}
  if (init) this.main_server_send_player.play_figures=Array();
  
  for (let i=0;i<this.meteor_play_figures.length;i++){
    
    if (init) this.main_server_send_player.play_figures.push(new server_play_figure());
    if (init) this.main_server_send_player.play_figures[i].ind=this.meteor_play_figures[i].ind;
    /*
    */
   this.add_to_server_playfigures(this.meteor_play_figures[i]);   
  }
  
//return this.main_server_send_player;
}

send_server_all(){
  
  let errorMessage:string;
  
  this.server_interaction.informStatus(this.main_server_send_player).then(
                        server_send_player => this.ret_arr = server_send_player,
                        error =>  errorMessage = <any>error);
//proc_server_response_player_figures()
}

hide_object(figure:play_figure){
  
  figure.hide_object();
  if (this.server_game && !this.server_leader) {
    this.add_to_server_playfigures(figure);
    this.main_server_send_player.play_figures[figure.ind].is_used_delta=true;
    this.meteor_play_figures[figure.ind].is_used_delta=true;
  }
}


add_to_server_playfigures(figure:play_figure){
  let i:number=figure.ind;
  //this.main_server_send_player.play_figures[i].ind=this.meteor_play_figures[i].ind;
  this.main_server_send_player.play_figures[i].current_source_index=this.meteor_play_figures[i].current_source_index;
  this.main_server_send_player.play_figures[i].visibility=this.meteor_play_figures[i].visibility;
  this.main_server_send_player.play_figures[i].status=this.meteor_play_figures[i].status;
  this.main_server_send_player.play_figures[i].coord_x=this.meteor_play_figures[i].coord_x;   
  this.main_server_send_player.play_figures[i].coord_y=this.meteor_play_figures[i].coord_y;
  //this.main_server_send_player.play_figures[i].current_source_index=this.meteor_play_figures[i].current_source_index;
}

generate_figure_ind(){
  for (let i=0;i<this.meteor_play_figures.length;i++){
    this.meteor_play_figures[i].ind=i;
  }
}

init_server_delta(){
  for (let i=0;i<this.meteor_play_figures.length;i++)
    this.main_server_send_player.play_figures[i].is_used_delta=false;
  for (let i=0;i<this.meteor_play_figures.length;i++)
    this.meteor_play_figures[i].is_used_delta=false;
}
proc_server_response_delta(){ // process delta for leader
  let ind:number;
  //console.log(JSON.stringify(this.ret_arr));
for (let i=0;i<this.ret_arr.play_figures.length;i++){
  ind = this.ret_arr.play_figures[i].ind;
  if (this.ret_arr.play_figures[i].is_used_delta && this.meteor_play_figures[i].play_type!='player'){
    this.meteor_play_figures[ind].visibility= this.ret_arr.play_figures[i].visibility;
  }
}
}
proc_server_response_other_players(){// process other players
  let ind:number;

  let koef_x:number;
  let koef_y:number;
  
    koef_x=this.standard.right/this.ret_arr.players[0].display_width;
    koef_y=this.standard.bottom/this.ret_arr.players[0].display_height;

for (let i=0;i<this.ret_arr.players.length;i++){
  ind = this.ret_arr.players[i].ind;
  if (ind!=this.server_player_ind){    
      this.player_figures[ind].man_play_figure.coord_x=this.ret_arr.players[i].coord_x*koef_x;
      this.player_figures[ind].man_play_figure.coord_y=this.ret_arr.players[i].coord_y*koef_y;
      this.player_figures[ind].man_play_figure.current_source_index=this.ret_arr.players[i].current_source_index;
      if (!this.server_leader){
      this.player_figures[ind].live_count=this.ret_arr.players[i].live_count;
      this.player_figures[ind].total_scores=this.ret_arr.players[i].total_scores;
      this.player_figures[1].live_count=this.ret_arr.players[i].nonleader_live_count;
      this.player_figures[1].total_scores=this.ret_arr.players[i].nonleader_total_scores;              
      }
      this.player_figures[ind].weapon_coord_x=this.ret_arr.players[i].weapon_coord_x;
      this.player_figures[ind].weapon_coord_y=this.ret_arr.players[i].weapon_coord_y;
      this.player_figures[ind].weapon_gan_bullets=this.ret_arr.players[i].weapon_gan_bullets;
      this.player_figures[ind].weapon_img=this.ret_arr.players[i].weapon_img;
      this.player_figures[ind].weapon_length=this.ret_arr.players[i].weapon_length;
      this.player_figures[ind].weapon_shift_left=this.ret_arr.players[i].weapon_shift_left;
      this.player_figures[ind].weapon_shift_top=this.ret_arr.players[i].weapon_shift_top;
      this.player_figures[ind].weapon_visibility=this.ret_arr.players[i].weapon_visibility;
      this.player_figures[ind].weapon_width=this.ret_arr.players[i].weapon_width;
      if (!this.server_leader){           
      this.player_figures[ind].blow_img=this.ret_arr.players[i].blow_img;
      this.player_figures[ind].blow_img_visibility=this.ret_arr.players[i].blow_img_visibility;
      this.player_figures[ind].blow_shift_left=this.ret_arr.players[i].blow_shift_left;
      this.player_figures[ind].blow_shift_top=this.ret_arr.players[i].blow_shift_top;
      this.player_figures[ind].blow_z_index=this.ret_arr.players[i].blow_z_index;
      this.player_figures[ind].blow_counter=this.ret_arr.players[i].blow_counter;
      this.player_figures[ind].blow_counter_setvalue=this.ret_arr.players[i].blow_counter_setvalue;
      this.player_figures[ind].blow_coord_x=this.ret_arr.players[i].blow_coord_x;
      
      this.player_figures[ind].blow_coord_y=this.ret_arr.players[i].blow_coord_y;
      
      //this.player_figures[1].blow_img_visibility=this.ret_arr.players[i].nonleader_blow_img_visibility;
      this.player_figures[1].blow_counter = this.ret_arr.players[i].nonleader_blow_counter;
      //this.player_figures[1].blow_coord_x=this.ret_arr.players[i].nonleader_blow_coord_x;
      //this.player_figures[1].blow_coord_y=this.ret_arr.players[i].nonleader_blow_coord_y;      
      
      }        
      //console.log('ind='+ind+';x:'+this.ret_arr.players[i].coord_x+';y:'+this.ret_arr.players[i].coord_y);
  }
}
}
proc_server_response_player_figures(){// non leader 
  let ind:number;
  let koef_x:number;
  let koef_y:number;
  koef_x=this.standard.right/this.ret_arr.players[0].display_width;
  koef_y=this.standard.bottom/this.ret_arr.players[0].display_height;
  //console.log('----------'+koef_x+'-------');
for (let i=0;i<this.ret_arr.play_figures.length;i++){
  ind = this.ret_arr.play_figures[i].ind;
  if (this.meteor_play_figures[i].play_type!='player' && this.ret_arr.play_figures[i].is_used_delta==false){
    this.meteor_play_figures[ind].visibility= this.ret_arr.play_figures[i].visibility;
    this.meteor_play_figures[ind].coord_x= this.ret_arr.play_figures[i].coord_x*koef_x;
    if (this.meteor_play_figures[ind].bottom == null)
    this.meteor_play_figures[ind].coord_y= this.ret_arr.play_figures[i].coord_y*koef_y;
    this.meteor_play_figures[ind].current_source_index= this.ret_arr.play_figures[i].current_source_index;
    this.meteor_play_figures[ind].is_used_delta= this.ret_arr.play_figures[i].is_used_delta;  
    //if (ind==1) console.log('ind1='+ind+';ind2='+this.ret_arr.play_figures[i].ind + ';y:' + this.ret_arr.play_figures[i].coord_y + ';x:' + this.ret_arr.play_figures[i].coord_x + ';visibility:'+this.ret_arr.play_figures[i].visibility +';x2'+this.meteor_play_figures[ind].coord_x);   
  }
}
}
}// end class
