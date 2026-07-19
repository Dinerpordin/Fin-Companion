"""
Shared pytest fixtures for apps/api unit tests.

These tests are pure-unit tests - they import service functions directly
without spinning up a DB or HTTP server, so no async fixtures are needed.
"""
