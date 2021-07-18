import babel, { TransformOptions } from '@babel/core';
import { BuildOptions } from '../type';

export function getBabelConfig(type: 'cjs' | 'esm', options: BuildOptions) {
  const { mode = 'app', isDevelopment, isProduction } = options;

  const config: TransformOptions = {
    babelrc: false,
    configFile: false,
    sourceType: 'unambiguous',
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          modules: false,
        },
      ],
      [
        require.resolve('@babel/preset-react'),
        {
          runtime: 'automatic',
        },
      ],
      require.resolve('@babel/preset-typescript'),
    ],
    plugins: [require.resolve('@babel/plugin-transform-runtime')],
  };

  if (mode === 'component') {
    // 打包组件时需要转换引入的文件 less → css
    config.plugins!.push([
      {
        name: 'rename-less',
        visitor: {
          ImportDeclaration: (path: any) => {
            if (path.node.source.value.endsWith('.less')) {
              path.node.source.value = path.node.source.value.replace(/\.less$/, '.css');
            }
          },
        },
      },
    ]);
  } else {
    if (isProduction) {
      config.compact = true;
    }

    config.plugins!.push([
      require.resolve('babel-plugin-import'),
      {
        libraryName: 'antd',
        libraryDirectory: 'es',
        style: true,
      },
    ]);
  }

  if (isDevelopment) {
    config.plugins!.push(require.resolve('react-refresh/babel'));
  }

  return config;
}

export default function babelTransform(type: 'cjs' | 'esm', file: any) {
  // @ts-ignore
  const config = getBabelConfig(type);

  return (
    babel.transform(file.contents, {
      ...config,
      filename: file.path,
    })?.code || ''
  );
}
