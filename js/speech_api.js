    var recognition;
    var recognizing = false;

    // Check for browser support
    if (!('webkitSpeechRecognition' in window)) {
      alert("Your browser does not support the Web Speech API. Please try Chrome.");
    } else {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true; // Enable continuous recognition
      recognition.interimResults = true; // Enable interim results
      recognition.lang = 'ar-SA'; // Set language to Arabic

      var final_transcript = '';
      var interim_transcript = '';
      recognition.onresult = function(event) {
        interim_transcript = ''; // Clear interim transcript at start of result event
      
        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }
        }
      
        // Split the interim transcript into lines based on the width of the #interim element
        var maxWidth = document.getElementById('interim').offsetWidth;
        var lines = [];
        var line = '';
        var words = interim_transcript.split(' ');
        var tempElement = document.createElement('div');
        tempElement.style.fontFamily = '-R--SLM-TV';
        tempElement.style.fontSize = '30px';
        tempElement.style.visibility = 'hidden';
        document.body.appendChild(tempElement);
      
        for (var i = 0; i < words.length; i++) {
          tempElement.textContent = line + ' ' + words[i];
          if (tempElement.offsetWidth > maxWidth) {
            lines.push(line);
            line = words[i];
          } else {
            line += ' ' + words[i];
          }
        }
        lines.push(line);
        document.body.removeChild(tempElement);
      
        // Limit the interim transcript to the last two lines
        if (lines.length > 2) {
          lines = lines.slice(-2);
        }
        interim_transcript = lines.join('\n');
      
        // Update the paragraphs with the transcripts
        document.getElementById('interim').textContent = '' + interim_transcript;
        //document.getElementById('final').textContent = '' + final_transcript;
      };

      // Start the speech recognition automatically
      recognition.start();
      recognizing = true;
    }

    // Function to get the stream links from the backend
async function getStreamLinks() {
  const response = await fetch('https://ahmedesawy.pythonanywhere.com/api/stream-links');
  const data = await response.json();
  return data.links;
}

// Function to set the video source
function setVideoSource(url) {
  if(Hls.isSupported()) {
      var hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoElement);
      hls.on(Hls.Events.MANIFEST_PARSED, function() {
          videoElement.play();
      });
  }
  // hls.js is not supported on platforms that do not have Media Source Extensions (MSE) enabled.
  else if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
      videoElement.src = url;
      videoElement.addEventListener('loadedmetadata', function() {
          videoElement.play();
      });
  }
}

// Function to load the stream links into the select element
async function loadStreamLinks() {
  const links = await getStreamLinks();
  const qualitySelect = document.getElementById('quality-select');

  // Remove all existing options
  while (qualitySelect.firstChild) {
      qualitySelect.firstChild.remove();
  }

  // Add the new options
  for (const link of links) {
      const option = document.createElement('option');
      option.value = link.url;
      option.textContent = link.name;
      qualitySelect.appendChild(option);
  }

  // Set the video source to the first stream link
  if (links.length > 0) {
      setVideoSource(links[0].url);
  }
}

// Load the stream links when the page loads
loadStreamLinks();

// Get the video element and the quality select element
const videoElement = document.getElementById('live-stream');
const qualitySelect = document.getElementById('quality-select');

// Change the video source when a new option is selected
qualitySelect.addEventListener('change', function() {
  setVideoSource(this.value);
});

