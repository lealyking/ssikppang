'use strict';
const $=s=>document.querySelector(s), words={'ko-KR':{word:'식빵!',hint:'SSIKPPANG! · 이런… 식빠아아앙!'},'en-US':{word:'Argh!',hint:'ARGH! · LET IT ALL OUT'},'ja-JP':{word:'うわっ!',hint:'UWA! · 마음을 비워내는 한마디'},'es-ES':{word:'¡Agh!',hint:'AGH! · SUÉLTALO TODO'}};
let busy=false,round=null,language='ko-KR',mood='release',playMode='voice',activeTap=null;
const loveWords={'ko-KR':{word:'좋아해',hint:'JO-A-HAE · 좋아하는 마음도 크게'},'en-US':{word:'I love you',hint:'I LOVE YOU · LET YOUR LOVE OUT'},'ja-JP':{word:'大好き',hint:'DAISUKI · 좋아하는 마음도 크게'},'es-ES':{word:'Te quiero',hint:'TE QUIERO · 좋아하는 마음도 크게'}};
function refreshWord(){const w=(mood==='love'?loveWords:words)[language];$('#word').textContent=w.word;$('#pronunciation').textContent=w.hint;}
let history=[];try{history=JSON.parse(localStorage.getItem('ssibal-history')||'[]');if(!Array.isArray(history))history=[];}catch{};
history=history.filter(r=>r&&words[r.language]&&(r.mode==='tap'?Number.isFinite(r.taps):Number.isFinite(r.db))).map(r=>({...r,mode:r.mode||'voice',word:(r.mood==='love'?loveWords:words)[r.language].word,score:r.mode==='tap'?tapScore(r.taps):score(r.db)}));
for(let i=0;i<36;i++){const b=document.createElement('i');b.style.height=(25+Math.sin(i*.7)*16+Math.sin(i*.21)*15+35)+'%';$('#meter').append(b)}
function meter(db){const n=Math.max(0,Math.min(36,(db+65)/65*36));[...$('#meter').children].forEach((x,i)=>x.classList.toggle('lit',i<n));$('#level').textContent=Number.isFinite(db)?db.toFixed(1)+' dBFS':'— dBFS';}
const REACTION_LABELS=['시큰둥','움찔','당황','뚜껑 열림','펑!'];
const LOVE_REACTIONS=['갸웃','꼬리 살랑','두근두근','신나서 폴짝','좋아해 폭발!'];
function reactionLevel(points){return points>=8000?4:points>=6000?3:points>=4000?2:points>=2000?1:0}
const COMIC_LINES=['흥, 그게 다야?','어? 잠깐만!','왜, 왜 이래?!','내 뚜껑 어디 갔어?!','속이 다 시원하다!'];
const LOVE_LINES=['나 불렀어?','나도 좋아!','심장이 두근두근!','좋아서 날아가!','좋아해가 넘친다!'];
const COMIC_SFX=['…','흠칫!','덜덜!','뻥!','콰아앙!'];
function setReaction(points,element=$('#face'),reactionMood=mood){const level=reactionLevel(points);element.dataset.reaction=String(level);element.dataset.mood=reactionMood;if(element===$('#face')){$('#comic-scene').dataset.reaction=String(level);$('#comic-scene').dataset.mood=reactionMood;$('#comic-bubble').textContent=(reactionMood==='love'?LOVE_LINES:COMIC_LINES)[level];$('#comic-sfx').textContent=reactionMood==='love'?['?','살랑!','두근!','폴짝!','좋아해!'][level]:COMIC_SFX[level];}return (reactionMood==='love'?LOVE_REACTIONS:REACTION_LABELS)[level]}
function resetReaction(){setReaction(0);$('#face').dataset.reaction='idle';$('#stage-lid').className=$('#stage-character').className+' reaction-lid';document.querySelectorAll('.reaction-scale span').forEach((x,i)=>x.textContent=(mood==='love'?LOVE_REACTIONS:REACTION_LABELS)[i])}

function render(){const list=history.filter(x=>x.language===language&&(x.mode||'voice')===playMode).sort((a,b)=>b.score-a.score).slice(0,10);$('#scores').replaceChildren();if(!list.length){const p=document.createElement('div');p.className='empty';p.textContent=playMode==='tap'?'아직 기록이 없어요. 첫 번째 두드림을 남겨보세요.':'아직 조용하네요. 첫 번째 외침을 남겨보세요.';$('#scores').append(p)}list.forEach((r,i)=>{const row=document.createElement('div');row.className='score-row';for(const [tag,text] of [['strong',String(i+1).padStart(2,'0')],['span',r.name],['small',`${r.word||words[language].word} · ${r.mode==='tap'?r.taps+'회':r.db.toFixed(1)+' dBFS'}`],['strong',r.score.toLocaleString()+' 점']]){const el=document.createElement(tag);el.textContent=text;row.append(el)}$('#scores').append(row)})}
$('#language').onchange=e=>{language=e.target.value;refreshWord();render()};
for(const b of document.querySelectorAll('[data-target]'))b.onclick=()=>{if(busy)return;document.querySelectorAll('[data-target]').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});b.classList.add('selected');b.setAttribute('aria-pressed','true');$('#target').value='';mood=b.dataset.mood;document.body.classList.toggle('love-mode',mood==='love');$('#stage-character').className='character-art char-'+b.dataset.character;$('#stage-caption').textContent=b.dataset.target+(mood==='love'?', 좋아해!':', 오늘은 너다!');refreshWord();resetReaction()};
$('#target').oninput=()=>{if(busy)return;mood='release';document.body.classList.remove('love-mode');document.querySelectorAll('[data-target]').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});$('#stage-character').className='character-art char-4';$('#stage-caption').textContent=$('#target').value.trim()||'오늘의 스트레스';refreshWord();resetReaction()};
const targetSlider=$('#target-slider');
function updateSliderArrows(){const max=targetSlider.scrollWidth-targetSlider.clientWidth;$('#target-prev').disabled=targetSlider.scrollLeft<=3;$('#target-next').disabled=targetSlider.scrollLeft>=max-3;}
$('#target-prev').onclick=()=>targetSlider.scrollBy({left:-(targetSlider.clientWidth*.8),behavior:'smooth'});
$('#target-next').onclick=()=>targetSlider.scrollBy({left:targetSlider.clientWidth*.8,behavior:'smooth'});
targetSlider.addEventListener('scroll',updateSliderArrows,{passive:true});window.addEventListener('resize',updateSliderArrows);
requestAnimationFrame(()=>{const selected=document.querySelector('[data-target].selected');if(selected)targetSlider.scrollLeft=selected.offsetLeft-targetSlider.offsetLeft;updateSliderArrows()});
$('#clear-records').onclick=()=>{if(busy||!window.confirm('이 브라우저에 저장된 모든 모드·언어의 게임 기록을 삭제할까요? 삭제한 기록은 복구할 수 없습니다.'))return;history=[];try{localStorage.removeItem('ssibal-history');$('#status').textContent='이 브라우저의 게임 기록을 삭제했어요.'}catch{$('#status').textContent='현재 화면의 기록은 비웠어요. 저장소 삭제가 차단되어 브라우저 설정에서 사이트 데이터를 확인해주세요.'}render()};
$('#ranking').onclick=()=>$('#records').scrollIntoView({behavior:'smooth'});
function lock(v){busy=v;$('#stop-round').hidden=!v&&!mic;$('#clear-records').disabled=v;$('#mode-voice').disabled=v;$('#mode-tap').disabled=v;$('#start').disabled=v;$('#demo').disabled=v;$('#language').disabled=v;$('#target').disabled=v;document.querySelectorAll('[data-target]').forEach(b=>b.disabled=v)}
function score(db){if(!Number.isFinite(db))return 0;return Math.floor(Math.pow(Math.max(0,Math.min(1,(db+60)/60)),4)*10000)}
function tapScore(taps){return Math.floor(10000*Math.pow(Math.max(0,Math.min(1,taps/40)),1.7))}
function showResult(data){round=data;const resultMood=data.mood||mood;const character=document.querySelector('[data-target].selected')?.dataset.character||'4';$('#result-art').className='character-art char-'+character;$('#result-lid').className='character-art reaction-lid char-'+character;$('#result-reactor').hidden=!data.valid&&!data.demo;$('#reaction-summary').textContent=data.valid||data.demo?setReaction(data.score,$('#result-reactor'),resultMood)+' · '+(reactionLevel(data.score)+1)+'/5 단계':'';$('#result-label').textContent=data.demo?'PREVIEW · 화면 체험':data.valid?'RELEASE COMPLETE · 측정 완료':'MIC CHECK · 입력 확인';$('#result-title').textContent=data.demo?'이런 느낌으로 터뜨려요.':data.valid?(data.mood==='love'?'좋아하는 마음, 전해졌나요?':'조금은 가벼워졌나요?'):'마이크 입력을 확인해주세요.';$('#result-score').textContent=data.valid||data.demo?data.score.toLocaleString()+' / 10,000 점':'—';$('#result-message').textContent=data.demo?'화면 체험용 예시 점수예요. 마이크 측정이나 순위에 반영되지 않아요.':data.valid&&data.mode==='tap'?`3초 동안 ${data.taps}회 두드렸어요! 손가락 모드의 같은 언어 기록과 비교해요.`:data.valid?`최고 150ms 평균 음량 ${data.db.toFixed(1)} dBFS. 고난도 · 1점 단위 기록. 이 기기의 같은 언어 기록과 비교해요.${data.db>-1 ? ' 입력 한계에 가까워요. 마이크에서 조금 떨어져 다시 측정해주세요.' : ''}`:data.message;$('#save').hidden=!data.valid||data.demo;$('#nickname').parentElement.hidden=!data.valid||data.demo;$('#result').showModal()}
$('#close').onclick=()=>$('#result').close();$('#again').onclick=()=>{$('#result').close();$('#start').focus()};$('#save').onclick=()=>{if(!round?.valid||round.demo)return;history.push({name:$('#nickname').value.trim()||'익명의 외침',score:round.score,db:round.db,language:round.language,word:round.word,mood:round.mood,mode:round.mode||'voice',taps:round.taps,date:Date.now()});history=history.sort((a,b)=>b.score-a.score).slice(0,200);try{localStorage.setItem('ssibal-history',JSON.stringify(history));$('#status').textContent='기록을 남겼어요. 다시 해볼까요?'}catch{$('#status').textContent='저장 공간을 사용할 수 없어 이번 실행에만 기록돼요.'}render();$('#result').close();round=null};
$('#demo').onclick=()=>{if(busy)return;releaseMic();lock(true);resetReaction();$('#status').textContent='5단계 반응 체험 · 실제 측정 아님';let t=0,after;const values=[800,2500,4500,6500,8500];const timer=setInterval(()=>{meter(-30+t*5);setReaction(values[t]);$('#stage-caption').textContent=(mood==='love'?LOVE_REACTIONS:REACTION_LABELS)[t];t++;if(t>=5){clearInterval(timer);after=setTimeout(()=>{cancelDemo=null;meter(-Infinity);lock(false);$('#status').textContent='체험을 마쳤어요. 원하는 모드로 시작해보세요.';showResult({demo:true,score:8500,mood})},650)}},550);cancelDemo=()=>{clearInterval(timer);clearTimeout(after);cancelDemo=null;meter(-Infinity);lock(false);resetReaction();$('#status').textContent='화면 체험을 멈췄어요.'}};



let mic=null,connecting=false,micRequestId=0,pendingAudio=null,cancelDemo=null;
const micMessage=e=>e.name==='NotAllowedError'?'마이크 권한이 필요해요. Safari의 웹사이트 설정에서 마이크를 허용해주세요.':e.name==='NotFoundError'?'마이크를 찾지 못했어요. 연결 상태를 확인해주세요.':'오디오를 시작하지 못했어요. Safari에서 다시 열어주세요.';
function releaseMic(){$('#stop-round').hidden=true;if(!mic)return;cancelAnimationFrame(mic.raf);clearTimeout(mic.idle);mic.stream?.getTracks().forEach(t=>t.stop());mic.ctx.close().catch(()=>{});mic=null;meter(-Infinity)}
$('#start').onclick=()=>{
 if(busy||connecting)return;
 if(playMode==='tap'){prepareTapRound();return}
 if(mic){startRound();return}
 if(!navigator.mediaDevices?.getUserMedia){$('#status').textContent='Safari에서 이 링크를 직접 열어주세요. HTTPS 마이크 지원이 필요해요.';return}
 // AudioContext must be activated directly inside the tap, before permission awaits.
 connecting=true;const requestId=++micRequestId;lock(true);$('#status').textContent='마이크 권한을 허용해주세요';
 let ctx,resume;
 try{ctx=new(window.AudioContext||window.webkitAudioContext)();pendingAudio=ctx;resume=ctx.resume();resume.catch(()=>{});}catch(e){connecting=false;lock(false);$('#status').textContent=micMessage(e);return}
 navigator.mediaDevices.getUserMedia({audio:{autoGainControl:{ideal:false},noiseSuppression:{ideal:false},echoCancellation:{ideal:false}}}).then(async stream=>{
 if(requestId!==micRequestId){stream.getTracks().forEach(t=>t.stop());ctx.close().catch(()=>{});return}
 try{
 await resume;
 const source=ctx.createMediaStreamSource(stream),analyser=ctx.createAnalyser(),silent=ctx.createGain();
 analyser.fftSize=2048;silent.gain.value=0;source.connect(analyser);analyser.connect(silent);silent.connect(ctx.destination);
 mic={ctx,stream,analyser,source,silent,raf:0,idle:0,frames:[],samples:[],recording:false,started:performance.now(),signal:false};
 const current=mic,buf=new Float32Array(analyser.fftSize);
 const tick=()=>{if(mic!==current)return;analyser.getFloatTimeDomainData(buf);let power=0;for(const x of buf)power+=x*x;const now=performance.now();current.samples.push({time:now,power:power/buf.length});current.samples=current.samples.filter(x=>now-x.time<150);const mean=current.samples.reduce((a,x)=>a+x.power,0)/current.samples.length;const db=mean>0?10*Math.log10(mean):-100;
 if(db>-85)current.signal=true;if(current.recording){current.frames.push({time:now,db});current.peakScore=Math.max(current.peakScore,score(db));const reaction=setReaction(current.peakScore);$('#stage-caption').textContent=reaction+' · '+current.peakScore.toLocaleString()+'점';}meter(db);
 if(!current.recording){$('#status').textContent=ctx.state!=='running'?'오디오가 일시 정지됐어요. 아래 버튼을 한 번 더 눌러주세요.':current.signal?'마이크 연결 완료 · 막대가 움직이면 아래 버튼을 누르세요':now-current.started>4000?'입력이 감지되지 않아요. Safari 마이크 권한·블루투스 연결을 확인해주세요.':'마이크 확인 중 · 가볍게 말해보세요';}
 current.raf=requestAnimationFrame(tick)};tick();
 current.idle=setTimeout(()=>{if(mic===current&&!busy){releaseMic();$('#start').textContent='마이크 다시 연결 ↗';$('#status').textContent='대기 시간이 지나 마이크를 껐어요.'}},60000);
 $('#start').textContent='준비 완료 · 한마디 외치기 ↗';
 }catch(e){stream.getTracks().forEach(t=>t.stop());ctx.close().catch(()=>{});$('#status').textContent=micMessage(e)}
 }).catch(e=>{ctx.close().catch(()=>{});if(requestId===micRequestId)$('#status').textContent=micMessage(e)}).finally(()=>{if(requestId!==micRequestId)return;connecting=false;pendingAudio=null;lock(false)});
};
function startRound(){
 const current=mic;
 current.ctx.resume().catch(()=>{});
 if(current.ctx.state!=='running'){$('#status').textContent='오디오를 활성화했어요. 잠시 후 버튼을 다시 눌러주세요.';return}
 lock(true);clearTimeout(current.idle);const lang=language,roundMood=mood,roundWord=(mood==='love'?loveWords:words)[language].word;let timer,finished=false;
 const finish=(message='')=>{if(finished)return;finished=true;clearInterval(timer);current.recording=false;
 const db=current.frames.length?Math.max(...current.frames.map(f=>f.db)):-Infinity;
 const valid=Number.isFinite(db)&&!message;
 releaseMic();lock(false);refreshWord();$('#start').textContent='마이크 연결하고 다시 하기 ↗';$('#status').textContent=valid?(roundMood==='love'?'좋아하는 마음을 전했어요.':'한마디를 비워냈어요.'):'마이크 연결 후 다시 시도해주세요.';
 showResult({valid,mode:'voice',language:lang,mood:roundMood,word:roundWord,db,score:score(db),message:message||'음량 데이터를 받지 못했어요. 마이크 권한을 확인하고 다시 시도해주세요.'});};
 resetReaction();current.finish=finish;current.frames=[];current.samples=[];current.peakScore=0;current.recording=true;
 const started=performance.now();const target=$('#target').value.trim()||document.querySelector('[data-target].selected')?.dataset.target||'스트레스';
 const update=()=>{const left=Math.max(0,3-(performance.now()-started)/1000);$('#status').textContent=target+(roundMood==='love'?'에게 좋아해! · ':'에게 마음껏! · ')+left.toFixed(1)+'초';if(left<=0)finish()};
 update();timer=setInterval(update,100);
}
function selectMode(next){if(busy)return;releaseMic();playMode=next;const tap=next==='tap';$('#mode-voice').setAttribute('aria-pressed',String(!tap));$('#mode-tap').setAttribute('aria-pressed',String(tap));document.body.classList.toggle('tap-mode',tap);$('#tap-pad').hidden=!tap;$('#audio-note').hidden=tap;$('#comfort-note').textContent=tap?'40회면 10,000점! 손에 힘을 빼고 가볍게 두드려요.':'목소리를 무리하게 키우지 말고 같은 거리에서 비교해요.';$('#tap-pad').disabled=true;$('#tap-pad-label').textContent='아래 준비 버튼부터!';$('#tap-count').textContent='0';$('#start').textContent=tap?'3초 두드리기 준비 ↗':'1. 마이크 연결하기 ↗';$('#mode-help').textContent=tap?'마이크 없이, 3초 동안 마음껏 두드려!':'목소리로 시원하게 · 3초';$('#status').textContent=tap?'준비를 누른 뒤 첫 터치부터 시작해요':'마이크를 연결하고 시작해요';$('#measurement-note').textContent=tap?'첫 클릭·터치부터 3초 동안 횟수를 세어요. 마이크 권한은 필요 없어요.':'발음 판정 없이 3초 동안 소리 크기만 측정해요. 음성은 녹음·전송하지 않아요.';$('#ranking-kind').textContent='이 기기 순위 · '+(tap?'손가락 모드':'소리 지르기')+' · 언어별';resetReaction();render()}
$('#mode-voice').onclick=()=>selectMode('voice');$('#mode-tap').onclick=()=>selectMode('tap');
function prepareTapRound(){releaseMic();lock(true);resetReaction();const lang=language,roundMood=mood,word=(mood==='love'?loveWords:words)[language].word;let count=0,started=null,timer,waiting;
 const finish=(cancelled=false)=>{if(!activeTap)return;activeTap=null;clearInterval(timer);clearTimeout(waiting);$('#tap-pad').disabled=true;$('#tap-pad-label').textContent=cancelled?'측정을 멈췄어요':'수고했어!';lock(false);$('#start').textContent='한 번 더 두드리기 ↗';$('#status').textContent=cancelled?'측정을 중단했어요. 이번 결과는 기록하지 않습니다.':'3초 끝! '+count+'회 두드렸어요';if(!cancelled)showResult({valid:true,mode:'tap',taps:count,score:tapScore(count),language:lang,mood:roundMood,word});};
 const update=()=>{const left=Math.max(0,3-(performance.now()-started)/1000);$('#status').textContent='두드려! · '+left.toFixed(1)+'초 남음';if(left<=0)finish()};
 activeTap={finish,hit:()=>{if(started!==null&&performance.now()-started>=3000){finish();return}if(started===null){started=performance.now();clearTimeout(waiting);timer=setInterval(update,30)}count++;$('#tap-count').textContent=String(count);const points=tapScore(count),label=setReaction(points);$('#stage-caption').textContent=label+' · '+points.toLocaleString()+'점';meter(-65+Math.min(1,count/40)*65);$('#level').textContent=count+'회';$('#tap-pad').classList.remove('hit');void $('#tap-pad').offsetWidth;$('#tap-pad').classList.add('hit');update();}};
 $('#tap-pad').disabled=false;$('#tap-count').textContent='0';$('#tap-pad-label').textContent='여기를 두드려!';$('#status').textContent='첫 클릭 / 터치부터 3초 시작!';$('#tap-pad').focus({preventScroll:true});waiting=setTimeout(()=>{if(activeTap&&started===null)finish(true)},30000);
}
$('#tap-pad').addEventListener('pointerdown',e=>{if(!activeTap||e.button!==0||e.isPrimary===false)return;e.preventDefault();activeTap.hit()});
$('#tap-pad').addEventListener('keydown',e=>{if((e.key===' '||e.key==='Enter')&&!e.repeat&&activeTap){e.preventDefault();activeTap.hit()}});
function stopPlaying(){if(cancelDemo){cancelDemo();return}if(activeTap){activeTap.finish(true);return}if(mic?.recording){mic.finish('측정을 중단했어요. 이번 결과는 기록하지 않습니다.');return}micRequestId++;connecting=false;pendingAudio?.close().catch(()=>{});pendingAudio=null;releaseMic();lock(false);$('#start').textContent=playMode==='tap'?'3초 두드리기 준비 ↗':'1. 마이크 연결하기 ↗';$('#status').textContent='마이크 연결을 중단했어요. 손가락 모드로도 즐길 수 있어요.'}
$('#stop-round').onclick=stopPlaying;
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&(busy||mic||connecting)){e.preventDefault();stopPlaying()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(cancelDemo){cancelDemo();return}if(connecting){stopPlaying();return}if(activeTap){activeTap.finish(true);return}if(mic){if(mic.recording){mic.finish('화면을 벗어나 측정을 멈췄어요. 다시 시작해주세요.');return}releaseMic();$('#start').textContent='마이크 다시 연결 ↗';$('#status').textContent='다른 화면으로 이동해 마이크를 껐어요.'}}});
render();
