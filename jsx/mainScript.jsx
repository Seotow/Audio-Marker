"object"!=typeof JSON&&(JSON={}),function(){"use strict";var rx_one=/^[\],:{}\s]*$/,rx_two=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,rx_three=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,rx_four=/(?:^|:|,)(?:\s*\[)+/g,rx_escapable=/[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,rx_dangerous=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta,rep;function f(t){return t<10?"0"+t:t}function this_value(){return this.valueOf()}function quote(t){return rx_escapable.lastIndex=0,rx_escapable.test(t)?'"'+t.replace(rx_escapable,function(t){var e=meta[t];return"string"==typeof e?e:"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+t+'"'}function str(t,e){var r,n,o,u,f,a=gap,i=e[t];switch(i&&"object"==typeof i&&"function"==typeof i.toJSON&&(i=i.toJSON(t)),"function"==typeof rep&&(i=rep.call(e,t,i)),typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";if(gap+=indent,f=[],"[object Array]"===Object.prototype.toString.apply(i)){for(u=i.length,r=0;r<u;r+=1)f[r]=str(r,i)||"null";return o=0===f.length?"[]":gap?"[\n"+gap+f.join(",\n"+gap)+"\n"+a+"]":"["+f.join(",")+"]",gap=a,o}if(rep&&"object"==typeof rep)for(u=rep.length,r=0;r<u;r+=1)"string"==typeof rep[r]&&(o=str(n=rep[r],i))&&f.push(quote(n)+(gap?": ":":")+o);else for(n in i)Object.prototype.hasOwnProperty.call(i,n)&&(o=str(n,i))&&f.push(quote(n)+(gap?": ":":")+o);return o=0===f.length?"{}":gap?"{\n"+gap+f.join(",\n"+gap)+"\n"+a+"}":"{"+f.join(",")+"}",gap=a,o}}"function"!=typeof Date.prototype.toJSON&&(Date.prototype.toJSON=function(){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},Boolean.prototype.toJSON=this_value,Number.prototype.toJSON=this_value,String.prototype.toJSON=this_value),"function"!=typeof JSON.stringify&&(meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},JSON.stringify=function(t,e,r){var n;if(indent=gap="","number"==typeof r)for(n=0;n<r;n+=1)indent+=" ";else"string"==typeof r&&(indent=r);if((rep=e)&&"function"!=typeof e&&("object"!=typeof e||"number"!=typeof e.length))throw new Error("JSON.stringify");return str("",{"":t})}),"function"!=typeof JSON.parse&&(JSON.parse=function(text,reviver){var j;function walk(t,e){var r,n,o=t[e];if(o&&"object"==typeof o)for(r in o)Object.prototype.hasOwnProperty.call(o,r)&&(void 0!==(n=walk(o,r))?o[r]=n:delete o[r]);return reviver.call(t,e,o)}if(text=String(text),rx_dangerous.lastIndex=0,rx_dangerous.test(text)&&(text=text.replace(rx_dangerous,function(t){return"\\u"+("0000"+t.charCodeAt(0).toString(16)).slice(-4)})),rx_one.test(text.replace(rx_two,"@").replace(rx_three,"]").replace(rx_four,"")))return j=eval("("+text+")"),"function"==typeof reviver?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}();

function addMarker(markerTime) {
    var sequence = app.project.activeSequence

    sequence.markers.createMarker(Number(markerTime))
    return
}

function getSelectedAudio() {
    const TICKS_PER_SECOND = 254016000000
    const selected = []

    var seq = app.project.activeSequence

    var audioTracks = seq.audioTracks

    for (var i = 0; i < audioTracks.length; i++) {
        var audioTrack = audioTracks[i]
        var audioClips = audioTrack.clips

        for (var j = 0; j < audioClips.length; j++) {
            var audioClip = audioClips[j]
            if (audioClip.isSelected()) {
                selected.push({
                    name: audioClip.name,
                    start:
                        audioClip.start.ticks / TICKS_PER_SECOND || 0.0000001,
                    path: audioClip.projectItem.getMediaPath(),
                })
            }
        }
    }
    return JSON.stringify(selected)
}

function getSelectedVideo() {
    const selected = []

    var seq = app.project.activeSequence

    var videoTracks = seq.videoTracks

    for (var i = 0; i < videoTracks.length; i++) {
        var videoTrack = videoTracks[i]
        var videoClips = videoTrack.clips

        for (var j = 0; j < videoClips.length; j++) {
            var videoClip = videoClips[j]
            if (videoClip.isSelected()) {
                selected.push(videoClip)
            }
        }
    }
    return selected
}

function saveProject() {
    app.project.save()
}

// Presets
function getDefaultMotion() {
    const seq = app.project.activeSequence
    const defaultMotionValue = [0.5, 0.5]
    const defaultMotion = [
        seq.frameSizeHorizontal * defaultMotionValue[0],
        seq.frameSizeVertical * defaultMotionValue[1],
    ]

    return JSON.stringify(defaultMotion)
}

function insertPreset(clip, properties) {
    var isSucceeded = false

    const beforeMotion = properties[0]
    const afterMotion = properties[1]
    const beforeScale = properties[2]
    const afterScale = properties[3]

    const seq = app.project.activeSequence

    const defaultMotionValue = [0.5, 0.5]
    const defaultMotion = JSON.parse(getDefaultMotion())

    const beforeMotionValue = [
        (beforeMotion[0] / defaultMotion[0]) * defaultMotionValue[0],
        (beforeMotion[1] / defaultMotion[1]) * defaultMotionValue[1],
    ]
    const afterMotionValue = [
        (afterMotion[0] / defaultMotion[0]) * defaultMotionValue[0],
        (afterMotion[1] / defaultMotion[1]) * defaultMotionValue[1],
    ]

    const scaleEffect = clip.components[1].properties[1]
    const motionEffect = clip.components[1].properties[0]


    scaleEffect.setTimeVarying(true)
    scaleEffect.addKey(clip.inPoint.seconds)
    scaleEffect.addKey(clip.outPoint.seconds)
    isSucceeded = scaleEffect.setValueAtKey(clip.inPoint.seconds, beforeScale)
    isSucceeded = scaleEffect.setValueAtKey(clip.outPoint.seconds, afterScale)

    motionEffect.setTimeVarying(true)
    motionEffect.addKey(clip.inPoint.seconds)
    motionEffect.addKey(clip.outPoint.seconds)
    isSucceeded = motionEffect.setValueAtKey(clip.inPoint.seconds, beforeMotionValue)
    isSucceeded = motionEffect.setValueAtKey(clip.outPoint.seconds, afterMotionValue)

    return isSucceeded
}

function insertRandomPreset(preset) {
    var isSucceeded = false
    
    const selected = getSelectedVideo()

    for (var i = 0; i < selected.length; i++) {
        var clip = selected[i]
        var randomPreset = preset[Math.floor((Math.random() * preset.length))]
        isSucceeded = insertPreset(clip, randomPreset)
    }

    return isSucceeded
}

function removePreset() {
    const selected = getSelectedVideo()

    for (var i = 0; i < selected.length; i++) {
        var clip = selected[i]
        var scaleEffect = clip.components[1].properties[1]
        var motionEffect = clip.components[1].properties[0]

        scaleEffect.setValue(100)
        motionEffect.setValue([0.5, 0.5])

        scaleEffect.setTimeVarying(false)
        motionEffect.setTimeVarying(false)
    }

    return true
}
