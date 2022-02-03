





export const  getUserMedia = async ( {video, audio}) => {
    try {
        // return  await navigator.mediaDevices.getUserMedia({video , audio});
        let vi = false ;
        if(video) {
            vi =  {width: {exact: 400}, height: {exact: 400}, facingMode: "user"}
        }
        return  await navigator.mediaDevices.getUserMedia({video: vi , audio});

    }catch (e) {
        console.log(e, video, audio);
        return null;
        // alert("Error opening your camera and/or microphone ");
    }
}

export const getDisplayMedia = async ({video, audio}) => {

    try {
        // return await navigator.mediaDevices.getDisplayMedia({video, audio});
        let vi = false ;
        if(video) {
            vi =  {width: {exact: 400}, height: {exact: 400}, facingMode: "user"}
        }
        return await navigator.mediaDevices.getDisplayMedia({video: vi, audio});
    }catch (e) {
        console.log(e);
        return null;
        // alert("Error capture your screen")
    }
}


