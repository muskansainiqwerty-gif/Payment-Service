import { Injectable } from "@nestjs/common";
import * as dotenv from "dotenv";

dotenv.config();
@Injectable()
class ConstantService {
  public config = {
    PROJECT_NAME: "",
    WHITELIST_DOMAINS: "*" as "*" | string[], // Allow "*" or array of strings
    SOCKET_PING_INTERVAL: 5000,
    SOCKET_PING_TIMEOUT: 5000,
    MAX_GAME_POINTS_LIMIT: 20,
    MAX_BUNCH_OF_COINS: 120,
  };

  constructor() {
    this.config.PROJECT_NAME = process.env.PROJECT_NAME;
    this.config.SOCKET_PING_INTERVAL = this.getEnvNumber(
      "SOCKET_PING_INTERVAL",
      this.config.SOCKET_PING_INTERVAL
    );
    this.config.SOCKET_PING_TIMEOUT = this.getEnvNumber(
      "SOCKET_PING_TIMEOUT",
      this.config.SOCKET_PING_TIMEOUT
    );
    this.config.WHITELIST_DOMAINS = this.getWhitelistDomains();
    this.config.MAX_GAME_POINTS_LIMIT =
      +process.env.MAX_GAME_POINTS_LIMIT || this.config.MAX_GAME_POINTS_LIMIT;
    this.config.MAX_BUNCH_OF_COINS =
      +process.env.MAX_BUNCH_OF_COINS || this.config.MAX_BUNCH_OF_COINS;
  }

  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    return value ? Number(value) : defaultValue;
  }

  private getWhitelistDomains(): "*" | string[] {
    const whitelist = process.env.WHITELIST_DOMAINS?.trim();
    // If the whitelist is "*" or empty, return "*" directly
    if (!whitelist || whitelist === "*") {
      return "*";
    }
    // If it's a JSON array, parse it
    if (this.isJsonArray(whitelist)) {
      return this.parseJsonArray(whitelist);
    }
    // Otherwise, split by comma and return an array
    return whitelist.split(",").map((domain) => domain.trim());
  }

  private isJsonArray(str: string): boolean {
    return str.startsWith("[") && str.endsWith("]");
  }

  private parseJsonArray(jsonString: string): string[] {
    try {
      const parsedArray = JSON.parse(jsonString);
      if (Array.isArray(parsedArray)) {
        return parsedArray.map((domain: string) => domain.trim());
      } else {
        return ["*"]; // Fallback to "*"
      }
    } catch (error) {
      return ["*"]; // Fallback to "*"
    }
  }
}

export default new ConstantService();
