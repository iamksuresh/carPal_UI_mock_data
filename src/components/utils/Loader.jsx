import React from 'react'
import { Dimmer, Loader, Segment } from 'semantic-ui-react'

const LoaderUi = () => (
    <div>
        <Dimmer active inverted>
          <Loader inverted>Loading</Loader>
        </Dimmer>
    </div>
)

export default LoaderUi;