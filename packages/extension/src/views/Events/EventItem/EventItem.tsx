import React from 'react'
import styled from 'styled-components'
import { Colors } from '../../../design'
import type { Event } from '../../../providers/events/State'
import { Badge } from './Badge'
import { getEventLabel } from './getEventLabel'
import { getNetworkColor } from './getNetworkColor'
import { Latency } from './Latency'

interface Props {
  event: Event
}

export function EventItem({ event }: Props) {
  const networkColor = getNetworkColor(event)
  return (
    <Wrapper>
      <Time>{event.time}</Time>
      <NetworkIndicator style={{ backgroundColor: networkColor }} />
      <Badge event={event} />
      <Label>{getEventLabel(event)}</Label>
      <Latency event={event} />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  align-items: center;
`

const Time = styled.div`
  color: ${Colors.Text2};
  font-size: 14px;
`

const NetworkIndicator = styled.div`
  height: 32px;
  width: 6px;
  margin: 1px 8px 1px 8px;
`

const Label = styled.div``
