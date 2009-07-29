#!/bin/sh

#Arg 1 = text input file, Arg 2 = filename for output

echo "Starting..."

start_time=$(date +%s)

#Make the scratch directory if its not there yet.
if [ ! -d "/tmp/sb_scratch" ];
	then
		echo "Temporary dir doesn't exist, creating."
    	mkdir /tmp/sb_scratch
fi

#if [ $lang == "" ]; 
#	then
#		lang="awb"
#fi

x=0

while read fileline
do
	#For each line, process audio, appending -n for each line.

	echo "Loading line into t2w..."
	echo "$fileline" | /usr/bin/text2wave -scale 2 -o /var/scripts/tmp/TTS-${2}-${x}.wav -eval "(voice_nitech_us_$3_arctic_hts)"

	interim_time=$(date +%s)

	echo "Converting to MP3, time taken so far: $((interim_time - start_time))s"
	result=`lame -f -S /var/scripts/tmp/TTS-${2}-${x}.wav /var/scripts/tmp/TTS-${2}-${x}.mp3.tmp`

	#Move the temp file to final file.
	mv /var/scripts/tmp/TTS-${2}-${x}.mp3.tmp /var/www/projectsportal/htdocs/seb/StudyBar/TTS/cache/TTS-${2}-${x}.mp3

	#Remove the temporary scratch file.
	rm /var/scripts/tmp/TTS-${2}-${x}.wav

	#echo $fileline
	x=`expr $x + 1`
done < $1


finish_time=$(date +%s)

echo "Done. Exec Time: $((finish_time - start_time))s Chunks: $x"