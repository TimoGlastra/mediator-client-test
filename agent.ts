import {
  Agent,
  ConnectionEventTypes,
  ConnectionStateChangedEvent,
  ConsoleLogger,
  HttpOutboundTransport,
  LogLevel,
  MediationStateChangedEvent,
  MediatorPickupStrategy,
  RoutingEventTypes,
  WsOutboundTransport,
} from "@aries-framework/core";
import { agentDependencies } from "@aries-framework/node";
import { inspect } from "node:util";

async function run() {
  const agent = new Agent(
    {
      label: "AFJ Mediator Test",
      walletConfig: {
        id: "test-mediator",
        key: "test",
      },
      logger: new ConsoleLogger(LogLevel.debug),
      mediatorPickupStrategy: MediatorPickupStrategy.Implicit,
      autoAcceptConnections: true,
      mediatorConnectionsInvite:
        "https://795d1f0d3059.ngrok.io?c_i=eyJAdHlwZSI6ICJkaWQ6c292OkJ6Q2JzTlloTXJqSGlxWkRUVUFTSGc7c3BlYy9jb25uZWN0aW9ucy8xLjAvaW52aXRhdGlvbiIsICJAaWQiOiAiNzJhYTNhNGMtZjM4ZC00MzYzLWFkODctZjEwNzQ3ZTM3NDVjIiwgImxhYmVsIjogIk1lZGlhdG9yIiwgInJlY2lwaWVudEtleXMiOiBbImptUmtEUnpXYkczeUFXNllFMkU4dDZHS3E2V0pEeUdTNVBneVAxWWViYXgiXSwgInNlcnZpY2VFbmRwb2ludCI6ICJodHRwczovLzc5NWQxZjBkMzA1OS5uZ3Jvay5pbyJ9",
    },
    agentDependencies
  );

  agent.registerOutboundTransport(new HttpOutboundTransport());
  agent.registerOutboundTransport(new WsOutboundTransport());

  agent.events.on<MediationStateChangedEvent>(
    RoutingEventTypes.MediationStateChanged,
    (event) => {
      console.log(
        inspect(event, { depth: null, showHidden: false, colors: true })
      );
    }
  );

  agent.events.on<ConnectionStateChangedEvent>(
    ConnectionEventTypes.ConnectionStateChanged,
    (event) => {
      console.log(
        inspect(event, { depth: null, showHidden: false, colors: true })
      );
    }
  );

  await agent.initialize();

  await new Promise((resolve) => setTimeout(resolve, 5000));

  const {
    invitation,
    connectionRecord: { id },
  } = await agent.connections.createConnection({});

  console.log(
    invitation.toUrl({
      useLegacyDidSovPrefix: true,
      domain: "https://example.com",
    })
  );

  await agent.connections.receiveInvitationFromUrl(
    invitation.toUrl({
      useLegacyDidSovPrefix: true,
      domain: "https://example.com",
    })
  );

  await new Promise((resolve) => setTimeout(resolve, 100000));
}

run();
