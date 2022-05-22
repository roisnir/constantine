import time
import json
from typing import Union
import requests
from datetime import date, datetime

def send(url, fp, chunk_size: Union[int, float]):
    if not (isinstance(chunk_size, int) or chunk_size.is_integer()):
        raise ValueError('chunk_size must be an integer')
    log = open('requests.log', 'w')
    f = open(fp, 'rb')
    seq = 0
    while (chunk:=f.read(int(chunk_size))):
        time_read = datetime.now()
        res = requests.put(url, chunk, headers={
            'content-type': 'application/mpeg',
            'seq': str(seq),
            'ts': time_read.isoformat()
            })
        sc, data = res.status_code, res.text
        print(sc, data)
        res_data = json.loads(data)
        msg = f'seq: {seq}, read: {time_read.isoformat()}, response: {res_data["ts"]}\r\n'
        log.write(msg)
        print(msg)
        time.sleep(1.66)
        seq += 1
    f.close()
    log.close()


if __name__ == '__main__':
    # send('http://localhost:5000/audio', '/data/dev/icecast/AesopsFables64kbps_librivox.256kbps.mp3', 32000 * 1.68)
    send('http://localhost:5000/audio', '/data/dev/icecast/AesopsFables64kbps_librivox.8000.pcm', 16000 * 1.68)
