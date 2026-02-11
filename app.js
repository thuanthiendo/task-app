firebase.initializeApp({
  apiKey: "AIzaSyB-ldnW85PPEL3Y4SAbWEotRvmTLtzgq8o",
  authDomain: "task-75413.firebaseapp.com",
  projectId: "task-75413"
});
const db = firebase.firestore();

const USERS = {
  admin:{password:"123",role:"admin"},
  emp1:{password:"123",role:"employee"}
};

let currentUser=null;
let currentRole=null;

const days=["Thứ 2","Thứ 3","Thứ 4","Thứ 5","Thứ 6","Thứ 7","CN"];
let currentWeekStart=getMonday(new Date());

function getMonday(d){
  d=new Date(d);
  const day=d.getDay()||7;
  if(day!==1)d.setDate(d.getDate()-day+1);
  d.setHours(0,0,0,0);
  return d;
}

function dateFromWeek(i){
  const d=new Date(currentWeekStart);
  d.setDate(d.getDate()+i);
  return d.toISOString().slice(0,10);
}

window.login=()=>{
  const u=username.value.trim();
  const p=password.value.trim();
  if(!USERS[u]||USERS[u].password!==p){alert("Sai login");return;}
  currentUser=u;
  currentRole=USERS[u].role;
  loginBox.style.display="none";
  app.style.display="block";
  loadTasks();
  loadHistory();
};

async function addTask(){
  const name=nameInput.value;
  const day=dayInput.value;
  const task=taskInput.value;
  const time=timeInput.value;
  if(!name||!task||!time){alert("Thiếu dữ liệu");return;}

  await db.collection("tasks").add({
    name,day,
    date:dateFromWeek(dayInput.selectedIndex),
    task,time,
    weekStart:firebase.firestore.Timestamp.fromDate(currentWeekStart),
    done:false,
    createdAt:firebase.firestore.FieldValue.serverTimestamp()
  });

  taskInput.value="";
  timeInput.value="";
  loadTasks();
}

async function loadTasks(){
  const snap=await db.collection("tasks")
    .where("weekStart","==",firebase.firestore.Timestamp.fromDate(currentWeekStart))
    .get();

  const data={};
  snap.forEach(doc=>{
    const d=doc.data();
    if(!data[d.name])data[d.name]={};
    if(!data[d.name][d.day])data[d.name][d.day]=[];
    data[d.name][d.day].push({id:doc.id,...d});
  });

  renderTable(data);
}

function renderTable(data){
  tableHeader.innerHTML="<th>Tên</th>";
  days.forEach((day,i)=>{
    const d=new Date(currentWeekStart);
    d.setDate(d.getDate()+i);
    tableHeader.innerHTML+=`<th>${day}<br>${d.toLocaleDateString()}</th>`;
  });

  tableBody.innerHTML="";
  Object.keys(data).forEach(name=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td><b>${name}</b></td>`;

    days.forEach(day=>{
      const td=document.createElement("td");
      (data[name][day]||[]).forEach(t=>{
        const div=document.createElement("div");
        const cb=document.createElement("input");
        cb.type="checkbox";
        cb.checked=t.done;

        cb.onchange=async()=>{
          await db.collection("tasks").doc(t.id).update({done:cb.checked});
          if(cb.checked)addHistory(t.name,t.task,t.time);
        };

        const span=document.createElement("span");
        span.textContent=`[${t.time}] ${t.task}`;
        if(t.done)span.classList.add("done-task");

        div.append(cb,span);
        td.appendChild(div);
      });
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

function addHistory(employee,task,time){
  db.collection("history").add({
    employee,task,timeTask:time,
    checkedBy:currentUser,
    time:firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function loadHistory(){
  const snap=await db.collection("history").orderBy("time","desc").limit(100).get();
  historyBody.innerHTML="";
  snap.forEach(doc=>{
    const d=doc.data();
    historyBody.innerHTML+=`
      <tr>
        <td>${d.employee}</td>
        <td>[${d.timeTask}] ${d.task}</td>
        <td>${d.checkedBy}</td>
        <td>${d.time?.toDate().toLocaleString()||""}</td>
      </tr>`;
  });
}

/* ===== GỬI LỊCH CHO ESP ===== */
window.saveScheduleToESP=async()=>{
  const snap=await db.collection("tasks")
    .where("weekStart","==",firebase.firestore.Timestamp.fromDate(currentWeekStart))
    .where("done","==",false)
    .get();

  const schedule=[];
  snap.forEach(doc=>{
    const t=doc.data();
    const [y,m,d]=t.date.split("-").map(Number);
    const [hh,mm]=t.time.split(":").map(Number);
    const epoch=Math.floor(new Date(y,m-1,d,hh,mm).getTime()/1000);
    if(epoch>Date.now()/1000){
      schedule.push({epoch,title:t.task});
    }
  });

  schedule.sort((a,b)=>a.epoch-b.epoch);

  if(!schedule.length){alert("Không có task tương lai");return;}

  await db.collection("esp_devices").doc("esp32_01").set({
    push:true,
    schedule,
    updatedAt:firebase.firestore.FieldValue.serverTimestamp()
  },{merge:true});

  alert("Đã gửi lịch cho ESP32");
};
