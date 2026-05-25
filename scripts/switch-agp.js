#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const androidDir = path.join(projectRoot, "android");
const agpStatePath = path.join(projectRoot, ".agp-channel");

const channels = {
  agp9: {
    agpVersion: "9.2.0",
    builtInKotlin: "true",
    newDsl: "true",
  },
  agpPrev: {
    builtInKotlin: "false",
    newDsl: "false",
  },
};

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function write(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function replaceOrThrow(content, matcher, replacement, label) {
  if (!matcher.test(content)) {
    throw new Error(`Unable to update ${label}. Expected pattern not found.`);
  }
  return content.replace(matcher, replacement);
}

function updateChannel(channelName) {
  const channel = channels[channelName];
  if (!channel) {
    throw new Error(
      `Unknown channel "${channelName}". Use one of: ${Object.keys(channels).join(", ")}.`
    );
  }

  const buildGradlePath = path.join(androidDir, "build.gradle");
  const appBuildGradlePath = path.join(androidDir, "app/build.gradle");
  const gradlePropertiesPath = path.join(androidDir, "gradle.properties");

  let buildGradle = read(buildGradlePath);
  const agpClasspath = channel.agpVersion
    ? `classpath("com.android.tools.build:gradle:${channel.agpVersion}")`
    : `classpath("com.android.tools.build:gradle")`;
  buildGradle = replaceOrThrow(
    buildGradle,
    /classpath\("com\.android\.tools\.build:gradle(?::[^"]+)?"\)/,
    agpClasspath,
    "android/build.gradle AGP classpath"
  );
  write(buildGradlePath, buildGradle);

  let appBuildGradle = read(appBuildGradlePath);
  const kotlinPluginLine = 'apply plugin: "org.jetbrains.kotlin.android"';
  if (channelName === "agpPrev") {
    if (!appBuildGradle.includes(kotlinPluginLine)) {
      appBuildGradle = appBuildGradle.replace(
        'apply plugin: "com.facebook.react"',
        `apply plugin: "com.facebook.react"\n${kotlinPluginLine}`
      );
    }
  } else {
    appBuildGradle = appBuildGradle.replace(
      new RegExp(`\\n${kotlinPluginLine.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "g"),
      ""
    );
  }
  write(appBuildGradlePath, appBuildGradle);

  let gradleProperties = read(gradlePropertiesPath);
  gradleProperties = replaceOrThrow(
    gradleProperties,
    /^android\.builtInKotlin=(true|false)$/m,
    `android.builtInKotlin=${channel.builtInKotlin}`,
    "android/gradle.properties android.builtInKotlin"
  );
  gradleProperties = replaceOrThrow(
    gradleProperties,
    /^android\.newDsl=(true|false)$/m,
    `android.newDsl=${channel.newDsl}`,
    "android/gradle.properties android.newDsl"
  );
  write(gradlePropertiesPath, gradleProperties);

  write(agpStatePath, `${channelName}\n`);

  console.log(
    [
      `Switched to ${channelName}`,
      `AGP classpath: ${channel.agpVersion ? channel.agpVersion : "template default (unversioned)"}`,
      `Gradle wrapper: unchanged`,
      `app kotlin plugin: ${channelName === "agpPrev" ? "enabled" : "disabled"}`,
      `android.builtInKotlin=${channel.builtInKotlin}`,
      `android.newDsl=${channel.newDsl}`,
    ].join("\n")
  );
}

function printStatus() {
  const buildGradlePath = path.join(androidDir, "build.gradle");
  const appBuildGradlePath = path.join(androidDir, "app/build.gradle");
  const gradlePropertiesPath = path.join(androidDir, "gradle.properties");

  const buildGradle = read(buildGradlePath);
  const appBuildGradle = read(appBuildGradlePath);
  const gradleProperties = read(gradlePropertiesPath);

  const agp = buildGradle.match(
    /classpath\("com\.android\.tools\.build:gradle(?::([^"]+))?"\)/
  );
  const agpValue = agp?.[1] ? agp[1] : "template default (unversioned)";
  const builtInKotlin = gradleProperties.match(
    /^android\.builtInKotlin=(true|false)$/m
  )?.[1];
  const newDsl = gradleProperties.match(/^android\.newDsl=(true|false)$/m)?.[1];
  const appKotlinPluginEnabled = appBuildGradle.includes(
    'apply plugin: "org.jetbrains.kotlin.android"'
  );
  const channel = fs.existsSync(agpStatePath)
    ? read(agpStatePath).trim()
    : "not set";

  console.log(
    [
      `Channel marker: ${channel}`,
      `AGP: ${agpValue || "unknown"}`,
      `Gradle wrapper: unchanged`,
      `app kotlin plugin: ${appKotlinPluginEnabled ? "enabled" : "disabled"}`,
      `android.builtInKotlin=${builtInKotlin || "unknown"}`,
      `android.newDsl=${newDsl || "unknown"}`,
    ].join("\n")
  );
}

const command = process.argv[2];
if (command === "status") {
  printStatus();
  process.exit(0);
}

if (!command) {
  throw new Error("Missing command. Use: agp9, agpPrev, or status.");
}

updateChannel(command);
