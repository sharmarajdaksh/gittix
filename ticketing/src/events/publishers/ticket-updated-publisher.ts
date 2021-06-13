import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@microservices-with-react-and-node-sharmarajdaksh/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
