import React, { type FunctionComponent } from 'react';
import { Tab, TabList, TabPanel, Tabs } from 'react-aria-components';

import { CodeEditor } from '~/ui/components/.client/codemirror/code-editor';
import { ResponseHeadersViewer } from '~/ui/components/viewers/response-headers-viewer';

import type { GrpcRequestState } from '../../../routes/organization.$organizationId.project.$projectId.workspace.$workspaceId.debug';
import { GrpcStatusTag } from '../tags/grpc-status-tag';
import { Pane, PaneBody, PaneHeader } from './pane';
interface Props {
  grpcState: GrpcRequestState;
}

type GrpcResponseTab =
  | {
      id: string;
      name: string;
      type: 'headers';
      count: number;
    }
  | {
      id: string;
      name: string;
      type: 'response';
      text: string;
    };

export const GrpcResponsePane: FunctionComponent<Props> = ({
  grpcState: { running, responseMessages, responseHeaders, status, error },
}) => {
  const messageTabs: GrpcResponseTab[] = [
    ...(responseHeaders.length
      ? [
          {
            id: responseMessages.length === 0 ? 'default_selection' : 'headers',
            type: 'headers' as const,
            name: 'Headers',
            count: responseHeaders.length,
          },
        ]
      : []),
    ...responseMessages.map((m, index) => ({
      id: index === 0 ? 'default_selection' : m.id,
      type: 'response' as const,
      text: m.text,
      name: `Response ${index + 1}`,
    })),
  ];

  return (
    <Pane type="response">
      <PaneHeader className="row-spaced">
        <div className="no-wrap scrollable scrollable--no-bars pad-left">
          {running && <i className="fa fa-refresh fa-spin margin-right-sm" />}
          {status && <GrpcStatusTag statusCode={status.code} statusMessage={status.details} />}
          {!status && error && <GrpcStatusTag statusMessage={error.message} />}
        </div>
      </PaneHeader>
      <PaneBody>
        {messageTabs.length ? (
          <Tabs
            aria-label="Grpc tabbed messages tabs"
            className="flex h-full w-full flex-1 flex-col"
            defaultSelectedKey="default_selection"
          >
            <TabList
              items={messageTabs}
              className="flex h-(--line-height-sm) w-full shrink-0 items-center overflow-x-auto border-b border-solid border-b-(--hl-md) bg-(--color-bg)"
            >
              {item => (
                <Tab
                  className="flex h-full shrink-0 cursor-pointer items-center justify-between gap-2 px-3 py-1 text-(--hl) outline-hidden transition-colors duration-300 select-none hover:bg-(--hl-sm) hover:text-(--color-font) focus:bg-(--hl-sm) aria-selected:bg-(--hl-xs) aria-selected:text-(--color-font) aria-selected:hover:bg-(--hl-sm) aria-selected:focus:bg-(--hl-sm)"
                  id={item.id}
                >
                  <span>{item.name}</span>
                  {'count' in item && item.count > 0 && (
                    <span className="flex aspect-square items-center justify-between overflow-hidden rounded-lg border border-solid border-(--hl-md) p-2 text-xs">
                      {item.count}
                    </span>
                  )}
                </Tab>
              )}
            </TabList>
            {messageTabs
              .filter(msg => msg.id !== 'body')
              .map(m => (
                <TabPanel key={m.id} id={m.id} className="h-full w-full overflow-y-auto">
                  {m.type === 'headers' ? (
                    <ResponseHeadersViewer headers={responseHeaders} />
                  ) : (
                    m.text && (
                      <CodeEditor
                        id={'grpc-request-editor-tab' + m.id}
                        defaultValue={m.text}
                        mode="application/json"
                        enableNunjucks
                        readOnly
                        autoPrettify
                      />
                    )
                  )}
                </TabPanel>
              ))}
          </Tabs>
        ) : null}
      </PaneBody>
    </Pane>
  );
};
