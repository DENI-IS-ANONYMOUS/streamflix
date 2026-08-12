function makePlayer(m){
 const id='player';
 return `<div class="player-shell" id="${id}">
 <video id="video" preload="metadata" playsinline src="${m.video||''}"></video>
 <div class="player-shade"></div><div class="fullscreen-topbar" id="fullscreenTopbar"><button class="pbtn fs-exit" id="fsExitBtn" title="Exit fullscreen" aria-label="Exit fullscreen">←</button><span class="fs-title">${m.title}</span><span class="fs-spacer"></span><button class="pbtn orientation-btn" id="orientationBtn" title="Switch orientation" aria-label="Switch orientation"><span class="phone-icon" id="phoneIcon" aria-hidden="true"></span></button></div><div class="brightness-layer" id="brightnessLayer"></div><div class="caption-box" id="captionBox">Captions are enabled</div>
 <div class="gesture left" id="leftGesture"><div class="gesture-hud" id="leftHud">☀ 50%</div></div><div class="gesture right" id="rightGesture"><div class="gesture-hud" id="rightHud">🔊 50%</div></div>
 <button class="lock-overlay" id="unlockBtn" title="Unlock player">🔓</button>
 <div class="player-controls" id="playerControls"><div class="progress" id="progress"><div class="fill" id="progressFill"></div></div><div class="controls-row"><button class="pbtn" id="playBtn">▶</button><button class="pbtn" id="backBtn">↶</button><button class="pbtn" id="forwardBtn">↷</button><button class="pbtn" id="muteBtn">🔊</button><input class="volume" id="volume" type="range" min="0" max="1" step="0.01" value="1"><span class="time" id="time">0:00 / 0:00</span><span class="spacer"></span><button class="pbtn lock-btn" id="lockBtn" title="Lock player">🔒</button><button class="pbtn menu-btn" id="menuBtn" title="Player menu">⋮</button><button class="pbtn" id="fullBtn" title="Fullscreen">⛶</button></div></div>
 <div class="player-menu hidden" id="playerMenu"><button class="menu-item" id="speedOpen">Playback speed <span id="speedLabel">1x ›</span></button><div class="submenu hidden speed-menu" id="speedMenu">${[.25,.5,.75,1,1.25,1.5,1.75,2,2.5,3].map(x=>`<button class="menu-item speed-choice" data-speed="${x}">${x}x</button>`).join('')}</div><button class="menu-item" id="captionToggle">Captions <span id="captionStatus">Off</span></button><div class="submenu"><button class="menu-item" id="subtitleEnglish">Subtitles <span id="subtitleStatus">Off</span></button></div></div>
 </div>`;
}
function initPlayer(){
 const v=document.getElementById('video'); if(!v) return;
 const play=document.getElementById('playBtn'), progress=document.getElementById('progress'), fill=document.getElementById('progressFill'), time=document.getElementById('time'), vol=document.getElementById('volume'), mute=document.getElementById('muteBtn'), full=document.getElementById('fullBtn'), menu=document.getElementById('playerMenu'), menuBtn=document.getElementById('menuBtn'), speedOpen=document.getElementById('speedOpen'), speedMenu=document.getElementById('speedMenu'), speedLabel=document.getElementById('speedLabel'), captionToggle=document.getElementById('captionToggle'), captionStatus=document.getElementById('captionStatus'), captionBox=document.getElementById('captionBox'), sub=document.getElementById('subtitleEnglish'), subStatus=document.getElementById('subtitleStatus'), shell=document.getElementById('player'), brightness=document.getElementById('brightnessLayer'), phoneIcon=document.getElementById('phoneIcon');
 let locked=false, brightnessLevel=.5, captions=false, subtitles=false;
 const fmt=s=>{if(!isFinite(s))return'0:00';let h=Math.floor(s/3600),m=Math.floor(s%3600/60),sec=Math.floor(s%60).toString().padStart(2,'0');return h?`${h}:${m.toString().padStart(2,'0')}:${sec}`:`${m}:${sec}`};
 const sync=()=>{fill.style.width=(v.duration?(v.currentTime/v.duration*100):0)+'%';time.textContent=`${fmt(v.currentTime)} / ${fmt(v.duration)}`;play.textContent=v.paused?'▶':'❚❚'};
 play.onclick=()=>{wakeUI();v.paused?v.play():v.pause()}; document.getElementById('backBtn').onclick=()=>v.currentTime=Math.max(0,v.currentTime-10); document.getElementById('forwardBtn').onclick=()=>v.currentTime=Math.min(v.duration||0,v.currentTime+10);
 v.addEventListener('timeupdate',sync);v.addEventListener('loadedmetadata',sync);v.addEventListener('play',sync);v.addEventListener('pause',sync);
 progress.onclick=e=>{wakeUI();if(locked)return;let r=progress.getBoundingClientRect();v.currentTime=((e.clientX-r.left)/r.width)*(v.duration||0)};
 vol.oninput=()=>{wakeUI();v.volume=Number(vol.value);v.muted=v.volume===0;mute.textContent=v.muted?'🔇':'🔊'};mute.onclick=()=>{wakeUI();v.muted=!v.muted;mute.textContent=v.muted?'🔇':'🔊'};
 async function enterFullscreen(){
  try{
    if(!document.fullscreenElement){
      await shell.requestFullscreen?.();
      await lockOrientation('landscape');
    }
  }catch(e){}
}
async function exitFullscreen(){
  try{
    if(document.fullscreenElement) await document.exitFullscreen();
  }catch(e){}
}
async function lockOrientation(mode){
  try{
    if(document.fullscreenElement && screen.orientation?.lock) await screen.orientation.lock(mode);
  }catch(e){}
}
function isPortrait(){ return !!screen.orientation?.type?.startsWith('portrait'); }
function updateOrientationIcon(){
  if(!phoneIcon) return;
  // The icon shows the orientation the button will switch TO.
  phoneIcon.classList.toggle('target-landscape', isPortrait());
  phoneIcon.classList.toggle('target-portrait', !isPortrait());
  const btn=document.getElementById('orientationBtn');
  const target=isPortrait()?'landscape':'portrait';
  const label=target==='landscape'?'Switch to landscape':'Switch to portrait';
  btn.title=label;
  btn.setAttribute('aria-label',label);
}
full.onclick=()=>{wakeUI();document.fullscreenElement?exitFullscreen():enterFullscreen()};
const fsExit=document.getElementById('fsExitBtn'), orientationBtn=document.getElementById('orientationBtn');
fsExit.onclick=()=>{wakeUI();exitFullscreen()};
orientationBtn.onclick=async()=>{
  if(!document.fullscreenElement) return;
  const portrait=screen.orientation?.type?.startsWith('portrait');
  await lockOrientation(portrait?'landscape':'portrait');
  updateOrientationIcon();
};
document.addEventListener('fullscreenchange',async()=>{
  const isFs=document.fullscreenElement===shell;
  shell.classList.toggle('is-fullscreen',isFs);
  if(isFs){ await lockOrientation('landscape'); updateOrientationIcon(); }
  else { try{screen.orientation?.unlock?.()}catch(e){} updateOrientationIcon(); }
});
if(screen.orientation) screen.orientation.addEventListener?.('change',updateOrientationIcon);
 menuBtn.onclick=()=>{wakeUI();menu.classList.toggle('hidden')};speedOpen.onclick=()=>{wakeUI();speedMenu.classList.toggle('hidden')};
 document.querySelectorAll('.speed-choice').forEach(b=>b.onclick=()=>{v.playbackRate=Number(b.dataset.speed);speedLabel.textContent=b.dataset.speed+'x ›';speedMenu.classList.add('hidden')});
 captionToggle.onclick=()=>{wakeUI();captions=!captions;captionStatus.textContent=captions?'On':'Off';captionBox.classList.toggle('on',captions);captionBox.textContent=captions?'English captions enabled':'Captions are off'};
 sub.onclick=()=>{wakeUI();subtitles=!subtitles;subStatus.textContent=subtitles?'English':'Off';captions=true;captionStatus.textContent='On';captionBox.classList.add('on');captionBox.textContent=subtitles?'English subtitles enabled':'Subtitles are off'};
 document.getElementById('lockBtn').onclick=()=>{wakeUI();locked=true;shell.classList.add('locked');menu.classList.add('hidden')};document.getElementById('unlockBtn').onclick=()=>{wakeUI();locked=false;shell.classList.remove('locked')};
 let sleepTimer=null;
 let uiSleeping=false;
 const SLEEP_DELAY=3200;
 function wakeUI(){
  uiSleeping=false;
  shell.classList.remove('ui-sleeping');
  clearTimeout(sleepTimer);
  sleepTimer=setTimeout(sleepUI,SLEEP_DELAY);
 }
 function sleepUI(){
  uiSleeping=true;
  shell.classList.add('ui-sleeping');
  menu.classList.add('hidden');
  speedMenu.classList.add('hidden');
 }
 // The player controls auto-hide in both normal and fullscreen modes. A touch/click
 // anywhere on the video box wakes them again.
 shell.addEventListener('pointerdown',()=>{
  if(uiSleeping){ wakeUI(); }
  else { clearTimeout(sleepTimer); sleepTimer=setTimeout(sleepUI,SLEEP_DELAY); }
 },{passive:true});
 shell.addEventListener('pointermove',()=>{
  if(!uiSleeping){ clearTimeout(sleepTimer); sleepTimer=setTimeout(sleepUI,SLEEP_DELAY); }
 },{passive:true});
 function gesture(el,hud,type){let startY=0,startLevel=0,active=false;el.addEventListener('touchstart',e=>{if(locked)return;startY=e.touches[0].clientY;startLevel=type==='brightness'?brightnessLevel:v.volume;active=true;el.classList.add('active')},{passive:true});el.addEventListener('touchmove',e=>{if(!active||locked)return;let dy=startY-e.touches[0].clientY;let val=Math.max(0,Math.min(1,startLevel+dy/260));if(type==='brightness'){brightnessLevel=val;brightness.style.opacity=String(.72*(1-val));hud.textContent='☀ '+Math.round(val*100)+'%'}else{v.volume=val;v.muted=false;vol.value=val;hud.textContent='🔊 '+Math.round(val*100)+'%'}},{passive:true});el.addEventListener('touchend',()=>{active=false;setTimeout(()=>el.classList.remove('active'),450)});}
 gesture(document.getElementById('leftGesture'),document.getElementById('leftHud'),'brightness');gesture(document.getElementById('rightGesture'),document.getElementById('rightHud'),'volume');
 shell.addEventListener('dblclick',e=>{if(locked)return;const r=shell.getBoundingClientRect();if(e.clientX<r.left+r.width/2)v.currentTime=Math.max(0,v.currentTime-10);else v.currentTime=Math.min(v.duration||0,v.currentTime+10)});
 document.addEventListener('keydown',e=>{if(locked)return;if(e.code==='Space'&&document.activeElement.tagName!=='INPUT'){e.preventDefault();play.click()}if(e.key==='ArrowLeft')v.currentTime=Math.max(0,v.currentTime-5);if(e.key==='ArrowRight')v.currentTime=Math.min(v.duration||0,v.currentTime+5);if(e.key.toLowerCase()==='m')mute.click();if(e.key.toLowerCase()==='f')full.click()});
 updateOrientationIcon();
 wakeUI();
 sync();
}
