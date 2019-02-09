import axios from 'axios';
import {WriteStream} from 'fs';
import {IncomingMessage} from 'http';
import {Writable} from 'stream';
import {AppConstants} from '../models/app-constants';
import {NGDataPayload} from '../models/ng-data-payload';

class DownloaderService {

  async fetchData(): Promise<NGDataPayload> {
    return axios.get(AppConstants.NG_URL)
      .then(res => res.data)
      .catch(error => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // console.log(error.response.data);
          // console.log(error.response.status);
          // console.log(error.response.headers);
          throw new Error('Error occurred - bad response:' + error.response);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of http.ClientRequest in node.js
          throw new Error('No response received:' + error.request);
        } else {
          throw new Error('Error occurred:' + error.message);
        }
      });
  }

  async fetchPhoto(url: string, writer: Writable): Promise<WriteStream> {

    const stream: IncomingMessage = await axios.get(url, {responseType: 'stream'})
      .then(res => res.data)
      .catch(error => {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          // console.log(error.response.data);
          // console.log(error.response.status);
          // console.log(error.response.headers);
          throw new Error('Error occurred - bad response:' + error.response);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of http.ClientRequest in node.js
          throw new Error('No response received:' + error.request);
        } else {
          throw new Error('Error occurred:' + error.message);
        }
      });


    stream.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

  }

}

export default new DownloaderService();