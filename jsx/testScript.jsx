function addMarker(markerTime) {
    var sequence = app.project.activeSequence

    // setTimeout(() => {
    //     sequence.markers.createMarker(Number(markerTime))
    // }, 100)
    sequence.markers.createMarker(Number(markerTime))
    return
}

function getSelected() {
    const TICKS_PER_SECOND = 254016000000

    var seq = app.project.activeSequence

    var audioTracks = seq.audioTracks

    for (var i = 0; i < audioTracks.length; i++) {
        var audioTrack = audioTracks[i]
        var audioClips = audioTrack.clips

        for (var j = 0; j < audioClips.length; j++) {
            var audioClip = audioClips[j]
            if (audioClip.isSelected()) {
                return JSON.stringify({
                    name: audioClip.name,
                    start: audioClip.start.ticks / TICKS_PER_SECOND,
                    path: audioClip.projectItem.getMediaPath(),
                })
            }
        }
    }
}

function saveProject() {
    app.project.save()
}