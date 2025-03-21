// src/decorator/memoryCache.decorator.ts
import { Decorator } from "../decorator/index.js";
import * as _ from "lodash-es";
import { notificationRegistry } from "./registry.js";
import { BaseNotification, NotificationBody, NotificationContext, NotificationDefine, NotificationInputDefine, NotificationInstanceConfig } from "./api.js";
import { isPlus } from "@certd/plus-core";

// 提供一个唯一 key
export const NOTIFICATION_CLASS_KEY = "pipeline:notification";
export const NOTIFICATION_INPUT_KEY = "pipeline:notification:input";

export function IsNotification(define: NotificationDefine): ClassDecorator {
  return (target: any) => {
    target = Decorator.target(target);

    const inputs: any = {};
    const properties = Decorator.getClassProperties(target);
    for (const property in properties) {
      const input = Reflect.getMetadata(NOTIFICATION_INPUT_KEY, target, property);
      if (input) {
        inputs[property] = input;
      }
    }
    _.merge(define, { input: inputs });
    Reflect.defineMetadata(NOTIFICATION_CLASS_KEY, define, target);
    target.define = define;
    notificationRegistry.register(define.name, {
      define,
      target,
    });
  };
}

export function NotificationInput(input?: NotificationInputDefine): PropertyDecorator {
  return (target, propertyKey) => {
    target = Decorator.target(target, propertyKey);
    // const _type = Reflect.getMetadata("design:type", target, propertyKey);
    Reflect.defineMetadata(NOTIFICATION_INPUT_KEY, input, target, propertyKey);
  };
}

export async function newNotification(type: string, input: any, ctx: NotificationContext) {
  const register = notificationRegistry.get(type);
  if (register == null) {
    throw new Error(`notification ${type} not found`);
  }

  // @ts-ignore
  const plugin = new register.target();
  for (const key in input) {
    plugin[key] = input[key];
  }
  if (!ctx) {
    throw new Error("ctx is required");
  }
  plugin.setDefine(register.define);
  plugin.setCtx(ctx);
  await plugin.onInstance();
  return plugin;
}

export async function sendNotification(opts: { config: NotificationInstanceConfig; ctx: NotificationContext; body: NotificationBody }) {
  const notification: BaseNotification = await newNotification(opts.config.type, opts.config.setting, opts.ctx);
  if (notification.define.needPlus && !isPlus()) {
    opts.body.content = `${opts.body.content}\n\n注意：此通知渠道已调整为专业版功能，后续版本将不再支持发送，请尽快修改或升级为专业版`;
  }
  await notification.doSend(opts.body);
}
