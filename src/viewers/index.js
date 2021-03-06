import vtkFullScreenRenderWindow  from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkColorTransferFunction   from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction       from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';

import userInterface from '../userInterface';

import imageRendering from './imageRendering';
import volumeRendering from './volumeRendering';

const viewers = { imageRendering, volumeRendering };

let pipeline = null;

function getPipeline() {
  return pipeline;
}

function createViewer(container, data, config) {
  userInterface.emptyContainer(container);
  const defaultConfig = { rootContainer: container, background: [0, 0, 0] };
  if (container) {
    defaultConfig.containerStyle = {
      position: 'relative',
      width: '100%',
      height: '100%',
      minHeight: '200px',
      minWidth: '200px',
      overflow: 'hidden',
    };
    defaultConfig.listenWindowResize = true;
  }
  const renderWindowConfiguration = config || defaultConfig;

  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance(renderWindowConfiguration);
  const renderer = fullScreenRenderer.getRenderer();
  const renderWindow = fullScreenRenderer.getRenderWindow();
  renderWindow.getInteractor().setDesiredUpdateRate(15);

  const dataArray = data.image.getPointData().getScalars();
  if (!dataArray) {
    console.error('No data array available in dataset');
  }

  const lookupTable = vtkColorTransferFunction.newInstance();
  const piecewiseFunction = vtkPiecewiseFunction.newInstance();

  const pipelineBuilder = viewers[data.type];
  if (pipelineBuilder) {
    pipeline = pipelineBuilder(data, renderer, renderWindow, piecewiseFunction, lookupTable);

    if (data.type.toString() === 'volumeRendering') {
      userInterface.createVolumeToggleUI(container, lookupTable, piecewiseFunction, pipeline.actor, dataArray, renderWindow);
    }
  } else {
    console.error(`No viewer found for ${data.type}`);
  }
  setImmediate(fullScreenRenderer.resize);
  renderWindow.render();
  return pipeline;
}

export default {
  createViewer,
  getPipeline,
};
