import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@microservices-with-react-and-node-sharmarajdaksh/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
