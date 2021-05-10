// Copyright 2016 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {buildStackTrace} from '../build-stack-trace';
import {ErrorMessage} from '../classes/error-message';
import {Configuration} from '../configuration';

/**
 * The handler setup function serves to produce a bound instance of the
 * of a factory for ErrorMessage class instances with configuration-supplied
 * service contexts automatically set.
 * @function handlerSetup
 * @param {NormalizedConfigurationVariables} config - the environmental
 *  configuration
 * @returns {ErrorMessage} - a new ErrorMessage instance
 */
export function handlerSetup(config: Configuration) {
  /**
   * The interface for creating new instances of the ErrorMessage class which
   * can be used to send custom payloads to the Error reporting service.
   * @returns {ErrorMessage} - returns a new instance of the ErrorMessage class
   */
  function newMessage() {
    // The API expects a reported error to contain a stack trace.
    // However, users do not need to provide a stack trace for ErrorMessage
    // objects built using the message builder.  Instead, here we store
    // the stack trace with the parts that reference the error-reporting's
    // internals removed.  Then when the error is reported, the stored
    // stack trace will be appended to the user's message for the error.
    //
    // Note: The stack trace at the point where the user constructed the
    //       error is used instead of the stack trace where the error is
    //       reported to be consistent with the behavior of reporting a
    //       an error when reporting an actual Node.js Error object.
    const cleanedStack = buildStackTrace('');

    const em = new ErrorMessage().setServiceContext(
      config.getServiceContext().service,
      config.getServiceContext().version
    );
    (
      em as {} as {
        _autoGeneratedStackTrace: string;
      }
    )._autoGeneratedStackTrace = cleanedStack;
    return em;
  }

  return newMessage;
}
