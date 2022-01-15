const drop_container = document.querySelector("#file-drop-container");
const input_btn = document.getElementById("input-type");
const browse_btn = document.getElementById("browse-btn");
const donwload_icon_image = document.getElementById("download-icon-img")
const uploadURL = "http://localhost:3000/api/files/";
const emailURL = "http://localhost:3000/api/files/send";
const deleteURL = "http://localhost:3000/deleting/";
const uploading_number = document.getElementById("uploading-number");
const page_wrap = document.getElementById("page-wrap");
const uploading_span = document.getElementById("uploading-span")
const progress_span = document.getElementById("progress-span");
const fileURL = document.getElementById("fileURL");
const link_box = document.getElementById("link-box");
const copy_btn = document.getElementById("copy-btn");
const emailForm = document.getElementById("email-form");
const reset_btn = document.getElementById("reset-btn");
const delete_btns = document.querySelectorAll(".delete-btn");

drop_container.addEventListener("dragover",(e)=>{
    e.preventDefault();
    console.log("dragging");
    if (!donwload_icon_image.classList.contains("dragged")){
        donwload_icon_image.classList.add("dragged");
    }
});

drop_container.addEventListener("dragleave",()=>{
    donwload_icon_image.classList.remove("dragged");
});

drop_container.addEventListener("drop",(e)=>{
    e.preventDefault();
    donwload_icon_image.classList.remove("dragged");
    const files = e.dataTransfer.files;
    if (files.length){
        input_btn.files = files;
        uploadFiles();
    }
});

input_btn.addEventListener("change",()=>{
    uploadFiles();
})

browse_btn.addEventListener("click",()=>{
    input_btn.click();
})

const uploadFiles = ()=> {
    if (input_btn.files.length > 1){
        input_btn.value = "";
        alert("Upload only one file...!");
        return;
    }
    if (input_btn.files[0].size> 100*1024*1024){
        alert("File size should be less than 100mb...!");
        return;
    }
    uploading_number.style.display="block";
    page_wrap.style.display="block";
    const file = input_btn.files[0];
    const formData = new FormData();
    formData.append("myfile",file);
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = ()=>{
        if (xhr.readyState === XMLHttpRequest.DONE){
            const myFile = JSON.parse(xhr.response);
            uploading_number.style.display="none";
            page_wrap.style.display="none";
            link_box.style.display="block";
            emailForm.style.display="block";
            fileURL.value=myFile.file;
            reset_btn.click();
        }
    }

    xhr.upload.onprogress = function (event){
        let percent = Math.round((100* event.loaded)/event.total);
        console.log(percent);
        progress_span.style.width=`${percent}%`;
        uploading_span.innerHTML=`${percent}`;
    }

    xhr.upload.onerror = () =>{
        input_btn.value="";
        alert(`Something went wrong...! ${xhr.statusText}`);
    }

    xhr.open("POST",uploadURL);
    xhr.send(formData);
}

copy_btn.addEventListener("click",()=>{
    document.querySelector(".pop-up").style.transform="translate(-50%,-25px)";
    setTimeout(() => {
        document.querySelector(".pop-up").style.top="-120px";
    }, 2000);
    fileURL.select();
    document.execCommand("copy");
})

emailForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    const url = fileURL.value;
    const formData = {
        uuid :url.split("/").splice(-1,1)[0],
        emailTo : emailForm.elements["receivers-email"].value,
        emailFrom : emailForm.elements["your-email"].value
    };

    fetch(emailURL , {
        method : "post",
        headers : {
            "Content-Type" : "application/json"
        },
        body : JSON.stringify(formData)
    }).then(res=>res.json()).then(({success})=>{
        if (success){
            alert("Email sent successfully...!");
            emailForm.style.display="none";
            link_box.style.display="none";
        }
        else {
            alert("Could not sent the email...Something went wrong...!");
        }
    })

});

delete_btns.forEach((delete_btn)=>{
    delete_btn.addEventListener("click",()=>{
        let id = delete_btn.id;
        console.log("Deleting");
        console.log(id);
        fetch(`http://localhost:3000/deleting/:${id}`,{
            method="post",
        }).then(res=res.json()).then(res => console.log(res));
    })
})
















