import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@microservices-with-react-and-node-sharmarajdaksh/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
