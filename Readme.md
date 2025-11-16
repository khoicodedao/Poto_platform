# run server livekit seft host

docker run --rm --name livekit -p 7880:7880 -p 7881:7881/tcp -p 7882:7882/udp livekit/livekit-server --dev --bind 0.0.0.0
