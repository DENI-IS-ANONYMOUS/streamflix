function getProfile(){
  return {
    username: localStorage.getItem('streamflix_username') || (localStorage.getItem('streamflix_email')||'Guest').split('@')[0],
    email: localStorage.getItem('streamflix_email') || '',
    avatar: localStorage.getItem('streamflix_avatar') || '',
    subscribed: localStorage.getItem('streamflix_subscribed') === '1'
  };
}
function avatarMarkup(size='normal'){
  const p=getProfile();
  return p.avatar ? `<img src="${p.avatar}" alt="Profile picture" class="profile-avatar-img ${size}" draggable="false">` : `<span class="profile-avatar-fallback ${size}">${(p.username||'G').charAt(0).toUpperCase()}</span>`;
}
function headerAvatarMarkup(){
  const p=getProfile();
  return p.avatar ? `<img src="${p.avatar}" alt="Profile picture" class="header-avatar-img" draggable="false">` : `<span class="header-avatar-fallback">${(p.username||'G').charAt(0).toUpperCase()}</span>`;
}
function renderHeaderAvatar(){
  document.querySelectorAll('.avatar').forEach(btn=>{
    btn.innerHTML=headerAvatarMarkup();
    btn.setAttribute('aria-label', `${getProfile().username} profile`);
  });
}
function verifiedMarkup(){ return getProfile().subscribed ? '<span class="verified" title="Subscribed">✓</span>' : ''; }
function openAccountMenu(){const menu=document.getElementById('accountMenu');if(!menu)return;menu.classList.toggle('hidden');renderAccountMenu();}
function closeAccountMenu(){document.getElementById('accountMenu')?.classList.add('hidden');}
function renderAccountMenu(){
  const box=document.getElementById('accountMenu');if(!box)return;const p=getProfile();
  box.innerHTML=`<div class="menu-profile-box" onclick="location.href='profile.html'"><div class="menu-avatar">${avatarMarkup('menu')}</div><div class="menu-profile-text"><strong>${escapeHtml(p.username)} ${verifiedMarkup()}</strong><span>${p.subscribed?'Subscribed':'Free account'}</span></div></div><div class="account-menu-links"><button onclick="location.href='index.html'"><span>⌂</span> Home</button><button onclick="location.href='profile.html#subscription'"><span>◆</span> Subscription</button><button onclick="location.href='profile.html#settings'"><span>⚙</span> Settings</button><button onclick="location.href='profile.html#about'"><span>ⓘ</span> About</button><button class="danger" onclick="signOut()"><span>↪</span> Logout</button></div>`;
}
function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function signOut(){localStorage.removeItem('streamflix_auth');closeAccountMenu();location.href='index.html?loggedout=1';}
function processAvatarFile(file,onDone){
  if(!file)return;
  if(!file.type.startsWith('image/')){toast?.('Please choose an image file');return;}
  if(file.size>4*1024*1024){toast?.('Choose an image smaller than 4 MB');return;}
  const reader=new FileReader();
  reader.onload=()=>{localStorage.setItem('streamflix_avatar',reader.result);renderProfilePage();renderAccountMenu();renderHeaderAvatar();onDone?.();};
  reader.readAsDataURL(file);
}
function saveAvatar(input){const file=input.files?.[0];if(!file)return;processAvatarFile(file,()=>toast?.('Profile picture updated'));input.value='';}
function createAccountWithAvatar(username,email,password,file){
  localStorage.setItem('streamflix_username',username);localStorage.setItem('streamflix_email',email);localStorage.setItem('streamflix_auth','1');localStorage.setItem('streamflix_subscribed','0');localStorage.removeItem('streamflix_avatar');
  if(file){const reader=new FileReader();reader.onload=()=>{localStorage.setItem('streamflix_avatar',reader.result);location.href='index.html';};reader.readAsDataURL(file);}else{location.href='index.html';}
}
function startUsernameEdit(){
  const display=document.getElementById('usernameDisplay');
  const editor=document.getElementById('usernameEditor');
  const button=document.getElementById('editUsernameBtn');
  const input=document.getElementById('usernameInput');
  if(!display||!editor||!input)return;
  input.value=getProfile().username;
  display.classList.add('hidden');
  button?.classList.add('hidden');
  editor.classList.remove('hidden');
  input.focus();
  input.select();
}
function cancelUsernameEdit(){
  const display=document.getElementById('usernameDisplay');
  const editor=document.getElementById('usernameEditor');
  const button=document.getElementById('editUsernameBtn');
  if(display)display.classList.remove('hidden');
  button?.classList.remove('hidden');
  editor?.classList.add('hidden');
  if(editor)document.getElementById('usernameInput').value=getProfile().username;
}
function saveUsername(){
  const input=document.getElementById('usernameInput'),value=input?.value.trim();
  if(!value||value.length<2){toast?.('Username must be at least 2 characters');return;}
  localStorage.setItem('streamflix_username',value);
  renderProfilePage();renderAccountMenu();renderHeaderAvatar();cancelUsernameEdit();toast?.('Username updated');
}
function toggleSubscription(){
  const next=getProfile().subscribed?'0':'1';localStorage.setItem('streamflix_subscribed',next);renderProfilePage();renderAccountMenu();renderHeaderAvatar();toast?.(next==='1'?'Subscription activated — verified badge added':'Subscription cancelled');
}
function renderProfilePage(){
  const p=getProfile(),avatar=document.getElementById('profileAvatarLarge');
  if(avatar)avatar.innerHTML=avatarMarkup('large');
  const name=document.getElementById('profileDisplayName');if(name)name.innerHTML=`${escapeHtml(p.username)} ${verifiedMarkup()}`;
  const email=document.getElementById('profileEmail');if(email)email.textContent=p.email;
  const display=document.getElementById('usernameDisplay');if(display)display.textContent=p.username;
  const input=document.getElementById('usernameInput');if(input)input.value=p.username;
  const subStatus=document.getElementById('subscriptionStatus');if(subStatus)subStatus.innerHTML=p.subscribed?'<span class="subscription-active">Active · Verified ✓</span>':'<span class="subscription-free">Free plan</span>';
  const subBtn=document.getElementById('subscriptionBtn');if(subBtn)subBtn.textContent=p.subscribed?'Cancel demo subscription':'Subscribe';
  renderHeaderAvatar();
}
function initProfilePage(){renderProfilePage();renderAccountMenu();const hash=location.hash.replace('#','');if(hash)document.getElementById(hash)?.scrollIntoView({behavior:'smooth',block:'start'});}
document.addEventListener('click',e=>{const menu=document.getElementById('accountMenu'),trigger=document.getElementById('accountMenuBtn');if(menu&&!menu.classList.contains('hidden')&&!menu.contains(e.target)&&e.target!==trigger)closeAccountMenu();});
